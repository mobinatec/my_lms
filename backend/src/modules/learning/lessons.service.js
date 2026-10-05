const {getPool}=require('../../infra/database');
const subscriptions=require('../subscriptions/subscriptions.service');
const analytics=require('../analytics/analytics.service');

async function resolveUser(userId){
  const r=await getPool().query('SELECT id,legacy_id,name,username FROM users WHERE legacy_id=$1 OR id::text=$1 LIMIT 1',[String(userId)]);
  return r.rows[0]||null;
}

async function getCourse(courseId){
  const r=await getPool().query(`SELECT id,title,course_type AS "courseType",access_plans AS "accessPlans" FROM courses WHERE id=$1`,[String(courseId)]);
  return r.rows[0]||null;
}

async function list(courseId){
  const r=await getPool().query(`SELECT id,course_id AS "courseId",title,position,video_key AS "videoKey",video_duration_seconds AS "durationSeconds",metadata,created_at AS "createdAt",updated_at AS "updatedAt" FROM lessons WHERE course_id=$1 ORDER BY position,id`,[String(courseId)]);
  return r.rows;
}

async function one(id){
  const r=await getPool().query(`SELECT id,course_id AS "courseId",title,position,video_key AS "videoKey",video_duration_seconds AS "durationSeconds",metadata,created_at AS "createdAt",updated_at AS "updatedAt" FROM lessons WHERE id=$1`,[String(id)]);
  return r.rows[0]||null;
}

async function canManage(user,courseId){
  if(!user)return false;
  if(user.role==='admin'||user.permissions?.includes('*')||user.permissions?.includes('lessons.manage'))return true;
  if(user.role!=='teacher')return false;
  const c=await getCourse(courseId);
  return !!c && String(c.metadata?.teacherId||'')===String(user.id);
}

async function create(user,payload){
  const courseId=String(payload.courseId||'');
  if(!courseId)throw Error('شناسه دوره الزامی است');
  if(!(await canManage(user,courseId)))throw Error('دسترسی مدیریت جلسات مجاز نیست');
  const id=String(payload.id||`lesson_${Date.now()}_${Math.random().toString(16).slice(2,7)}`);
  const position=Number.isFinite(Number(payload.position))?Number(payload.position):(await getPool().query('SELECT COALESCE(MAX(position),0)+1 AS next FROM lessons WHERE course_id=$1',[courseId])).rows[0].next;
  const r=await getPool().query(`INSERT INTO lessons(id,course_id,title,position,video_key,video_duration_seconds,metadata) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb) RETURNING id,course_id AS "courseId",title,position,video_key AS "videoKey",video_duration_seconds AS "durationSeconds",metadata,created_at AS "createdAt",updated_at AS "updatedAt"`,[id,courseId,String(payload.title||'جلسه جدید'),position,payload.videoKey||null,Number(payload.durationSeconds)||null,JSON.stringify(payload.metadata||{})]);
  await analytics.log({userId:user.id,role:user.role,action:'lesson_created',entity:'lesson',entityId:id,meta:{courseId}});
  return r.rows[0];
}

async function update(user,id,payload){
  const old=await one(id);if(!old)return null;
  if(!(await canManage(user,old.courseId)))throw Error('دسترسی ویرایش جلسه مجاز نیست');
  const r=await getPool().query(`UPDATE lessons SET title=COALESCE($2,title),position=COALESCE($3,position),video_key=COALESCE($4,video_key),video_duration_seconds=COALESCE($5,video_duration_seconds),metadata=COALESCE($6::jsonb,metadata),updated_at=NOW() WHERE id=$1 RETURNING id,course_id AS "courseId",title,position,video_key AS "videoKey",video_duration_seconds AS "durationSeconds",metadata,created_at AS "createdAt",updated_at AS "updatedAt"`,[id,payload.title??null,payload.position==null?null:Number(payload.position),payload.videoKey??null,payload.durationSeconds==null?null:Number(payload.durationSeconds),payload.metadata==null?null:JSON.stringify(payload.metadata)]);
  await analytics.log({userId:user.id,role:user.role,action:'lesson_updated',entity:'lesson',entityId:id,meta:{courseId:old.courseId}});
  return r.rows[0];
}

async function remove(user,id){
  const old=await one(id);if(!old)return false;
  if(!(await canManage(user,old.courseId)))throw Error('دسترسی حذف جلسه مجاز نیست');
  const r=await getPool().query('DELETE FROM lessons WHERE id=$1',[id]);
  await analytics.log({userId:user.id,role:user.role,action:'lesson_deleted',entity:'lesson',entityId:id,meta:{courseId:old.courseId}});
  return r.rowCount>0;
}

async function access(userId,courseId){
  const course=await getCourse(courseId);if(!course)return {allowed:false,message:'دوره یافت نشد'};
  const c={id:course.id,courseType:course.courseType,allowedPlans:course.accessPlans};
  return subscriptions.accessForCourse(userId,c);
}

async function progress(userId,lessonId,payload){
  const u=await resolveUser(userId);if(!u)throw Error('کاربر یافت نشد');
  const lesson=await one(lessonId);if(!lesson)throw Error('جلسه یافت نشد');
  const accessResult=await access(u.legacy_id,lesson.courseId);if(!accessResult.allowed)throw Error(accessResult.message);
  const position=Math.max(0,Math.floor(Number(payload.positionSeconds)||0));
  const watched=Math.max(0,Math.floor(Number(payload.watchedSeconds)||0));
  const duration=Math.max(0,Number(lesson.durationSeconds)||0);
  const percent=duration?Math.min(100,Math.max(0,(watched/duration)*100)):Math.min(100,Math.max(0,Number(payload.percent)||0));
  const completed=payload.completed===true||percent>=90;
  const r=await getPool().query(`INSERT INTO lesson_progress(user_id,lesson_id,position_seconds,watched_seconds,percent,completed,last_watched_at) VALUES($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT(user_id,lesson_id) DO UPDATE SET position_seconds=EXCLUDED.position_seconds,watched_seconds=GREATEST(lesson_progress.watched_seconds,EXCLUDED.watched_seconds),percent=GREATEST(lesson_progress.percent,EXCLUDED.percent),completed=lesson_progress.completed OR EXCLUDED.completed,last_watched_at=NOW() RETURNING id,user_id AS "userId",lesson_id AS "lessonId",position_seconds AS "positionSeconds",watched_seconds AS "watchedSeconds",percent,completed,last_watched_at AS "lastWatchedAt"`,[u.id,lessonId,position,watched,percent,completed]);
  await refreshCourseProgress(u.id,lesson.courseId);
  return r.rows[0];
}

async function refreshCourseProgress(userId,courseId){
  const r=await getPool().query(`SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE lp.completed)::int AS completed,COALESCE(AVG(lp.percent),0) AS average FROM lessons l LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=$1 WHERE l.course_id=$2`,[userId,courseId]);
  const x=r.rows[0];
  const progress=Number(x.total)?Math.round(Number(x.average)*100)/100:0;
  await getPool().query(`UPDATE enrollments SET progress=$3,progress_updated_at=NOW() WHERE user_id=$1 AND course_id=$2`,[userId,courseId,progress]);
  return {totalLessons:Number(x.total),completedLessons:Number(x.completed),progress};
}

async function myProgress(userId,courseId){
  const u=await resolveUser(userId);if(!u)return [];
  const r=await getPool().query(`SELECT lp.lesson_id AS "lessonId",lp.position_seconds AS "positionSeconds",lp.watched_seconds AS "watchedSeconds",lp.percent,lp.completed,lp.last_watched_at AS "lastWatchedAt" FROM lesson_progress lp JOIN lessons l ON l.id=lp.lesson_id WHERE lp.user_id=$1 AND l.course_id=$2 ORDER BY l.position,l.id`,[u.id,courseId]);
  return r.rows;
}

module.exports={list,one,create,update,remove,progress,myProgress,access,refreshCourseProgress};
