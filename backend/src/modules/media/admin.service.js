const fs = require('fs');
const path = require('path');
const { getPool } = require('../../infra/database');
const { connectCache } = require('../../infra/cache');
const jobs = require('./jobs');
const analytics = require('../analytics/analytics.service');
const QUEUE_KEY = 'codesazan:media:hls:queue';

async function list() {
  const pool = getPool();
  const [jobsResult, lessonsResult] = await Promise.all([
    pool.query(`SELECT mj.*, l.id AS lesson_id, l.title AS lesson_title, l.course_id AS lesson_course_id,
      c.title AS course_title
      FROM media_jobs mj
      LEFT JOIN lessons l ON l.video_key = mj.id
      LEFT JOIN courses c ON c.id = l.course_id
      ORDER BY mj.created_at DESC`),
    pool.query(`SELECT l.id, l.course_id AS "courseId", l.title, l.position, l.video_key AS "videoKey",
      l.video_duration_seconds AS "durationSeconds", c.title AS "courseTitle"
      FROM lessons l JOIN courses c ON c.id=l.course_id ORDER BY c.title,l.position,l.id`)
  ]);
  return {
    jobs: jobsResult.rows.map(row => ({
      ...row,
      durationSeconds: row.duration_seconds,
      lesson: row.lesson_id ? {id: row.lesson_id, title: row.lesson_title, courseId: row.lesson_course_id, courseTitle: row.course_title} : null
    })),
    lessons: lessonsResult.rows
  };
}

async function retry(id, user) {
  const job = await jobs.getJob(id);
  if (!job) return null;
  if (job.status !== 'failed') throw Error('فقط ویدئوی ناموفق قابل Retry است');
  if (!fs.existsSync(path.join(process.env.MEDIA_DIR || '/app/media', path.basename(job.filename)))) {
    throw Error('فایل اصلی ویدئو روی storage پیدا نشد');
  }
  const updated = await jobs.updateJob(id, {status:'queued', progress:0, quality:null, error:null, attempts:0, started_at:null, finished_at:null});
  const redis = await connectCache();
  await redis.set(`codesazan:media:hls:status:${id}`, JSON.stringify({id,status:'queued',progress:0,error:null,updatedAt:new Date().toISOString()}), {EX:604800});
  await redis.rPush(QUEUE_KEY, JSON.stringify({id:job.id,filename:job.filename,originalName:job.original_name,mime:job.mime}));
  await analytics.log({userId:user?.id,role:user?.role,action:'media_retry',entity:'media_job',entityId:id,meta:{filename:job.filename}});
  return updated;
}

async function attach(id, lessonId, user) {
  const job = await jobs.getJob(id);
  if (!job) return null;
  const pool = getPool();
  const lesson = await pool.query('SELECT id,course_id,title FROM lessons WHERE id=$1',[lessonId]);
  if (!lesson.rowCount) throw Error('درس انتخاب‌شده پیدا نشد');
  const duration = job.duration_seconds == null ? null : Number(job.duration_seconds);
  const r = await pool.query(`UPDATE lessons SET video_key=$1,video_duration_seconds=COALESCE($2,video_duration_seconds),updated_at=NOW() WHERE id=$3
    RETURNING id,course_id AS "courseId",title,video_key AS "videoKey",video_duration_seconds AS "durationSeconds"`,[job.id,duration,lessonId]);
  await analytics.log({userId:user?.id,role:user?.role,action:'media_attached_to_lesson',entity:'media_job',entityId:id,meta:{lessonId,courseId:lesson.rows[0].course_id}});
  return r.rows[0];
}

async function remove(id, user) {
  const job = await jobs.getJob(id);
  if (!job) return false;
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE lessons SET video_key=NULL,video_duration_seconds=NULL,updated_at=NOW() WHERE video_key=$1',[id]);
    await client.query('DELETE FROM media_jobs WHERE id=$1',[id]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }

  const mediaRoot = path.resolve(process.env.MEDIA_DIR || '/app/media');
  const source = path.join(mediaRoot, path.basename(job.filename));
  const hls = path.join(mediaRoot, 'hls', id);
  await fs.promises.rm(source, {force:true}).catch(()=>{});
  await fs.promises.rm(hls, {recursive:true,force:true}).catch(()=>{});
  await analytics.log({userId:user?.id,role:user?.role,action:'media_deleted',entity:'media_job',entityId:id,meta:{filename:job.filename}});
  return true;
}

module.exports={list,retry,attach,remove};
