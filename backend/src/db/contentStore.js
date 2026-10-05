const fs = require('fs');
const path = require('path');
const { getPool } = require('../infra/database');

const SOURCES = {
  portfolio: path.join(__dirname, '../modules/portfolio/data.json'),
  team: path.join(__dirname, '../modules/team/data.json'),
  services: path.join(__dirname, '../modules/services/data.json'),
  courses: path.join(__dirname, '../modules/courses/data.json'),
  blog: path.join(__dirname, '../modules/blog/data.json')
};

function legacy(type) {
  const file = SOURCES[type];
  if (!file) return [];
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function courseRow(item) {
  const plans = Array.isArray(item.plans) ? item.plans : [];
  const courseType = item.courseType || (plans.some(p => p.free === true || p.key === 'basic') ? 'free' : 'paid');
  const accessPlans = Array.isArray(item.allowedPlans)
    ? item.allowedPlans
    : courseType === 'vip' ? ['vip'] : courseType === 'free' ? ['free'] : ['normal', 'vip'];
  return {
    id: String(item.id),
    title: String(item.title || ''),
    slug: item.slug ? String(item.slug) : null,
    description: item.description || item.excerpt || '',
    level: item.level || null,
    courseType,
    accessPlans,
    metadata: item
  };
}

async function syncCourseRow(item) {
  const c = courseRow(item);
  await getPool().query(
    `INSERT INTO courses(id,title,slug,description,level,course_type,access_plans,metadata)
     VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)
     ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,slug=EXCLUDED.slug,description=EXCLUDED.description,
       level=EXCLUDED.level,course_type=EXCLUDED.course_type,access_plans=EXCLUDED.access_plans,
       metadata=EXCLUDED.metadata,updated_at=NOW()`,
    [c.id, c.title, c.slug, c.description, c.level, c.courseType, JSON.stringify(c.accessPlans), JSON.stringify(c.metadata)]
  );  const lessons=Array.isArray(item.lessons)?item.lessons:[];
  for(let i=0;i<lessons.length;i++){
    const l=lessons[i]||{};
    const lessonId=String(l.id||`${c.id}_lesson_${i+1}`);
    const videoMeta=l.videoMeta||{};
    await getPool().query(`INSERT INTO lessons(id,course_id,title,position,video_key,video_duration_seconds,metadata)
      VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)
      ON CONFLICT(id) DO UPDATE SET course_id=EXCLUDED.course_id,title=EXCLUDED.title,position=EXCLUDED.position,video_key=EXCLUDED.video_key,video_duration_seconds=EXCLUDED.video_duration_seconds,metadata=EXCLUDED.metadata,updated_at=NOW()`,
      [lessonId,c.id,String(l.title||`جلسه ${i+1}`),i+1,videoMeta.filename||l.videoKey||l.video||null,Number(l.durationSeconds)||null,JSON.stringify({...l,videoMeta})]);
  }
  if(lessons.length===0) await getPool().query('DELETE FROM lessons WHERE course_id=$1',[c.id]);
  else await getPool().query('DELETE FROM lessons WHERE course_id=$1 AND id <> ALL($2::text[])',[c.id,lessons.map((l,i)=>String(l.id||`${c.id}_lesson_${i+1}`))]);
}

async function seedLegacyContent() {
  const pool = getPool();
  for (const type of Object.keys(SOURCES)) {
    const items = legacy(type);
    for (const item of items) {
      const id = String(item.id);
      const existing = await pool.query(
        'SELECT 1 FROM content_items WHERE content_type=$1 AND id=$2 LIMIT 1',
        [type, id]
      );
      // JSON files are bootstrap data only. Never overwrite live PostgreSQL content.
      if (!existing.rowCount) {
        await pool.query(
          `INSERT INTO content_items(id, content_type, title, payload)
           VALUES($1,$2,$3,$4::jsonb)`,
          [id, type, String(item.title || item.name || ''), JSON.stringify({...item, id})]
        );
        if (type === 'courses') await syncCourseRow({...item, id});
      }
    }
    if (items.length) console.log(`✔ Seeded/synchronized ${type}: ${items.length}`);
  }
}

async function all(type, { category, level } = {}) {
  const pool = getPool();
  let sql = 'SELECT payload FROM content_items WHERE content_type=$1';
  const params = [type];
  if (category && type === 'portfolio') { sql += ` AND payload->>'category'=$2`; params.push(category); }
  if (level && type === 'courses') { sql += ` AND payload->>'level'=$2`; params.push(level); }
  sql += ' ORDER BY created_at ASC';
  const r = await pool.query(sql, params);
  return r.rows.map(x => x.payload);
}

async function get(type, id) {
  const r = await getPool().query('SELECT payload FROM content_items WHERE content_type=$1 AND id=$2', [type, String(id)]);
  return r.rows[0]?.payload || null;
}

async function save(type, item) {
  const id = String(item.id || `${type}_${Date.now()}`);
  const payload = {...item, id};
  const title = String(payload.title || payload.name || '');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      `INSERT INTO content_items(id,content_type,title,payload)
       VALUES($1,$2,$3,$4::jsonb)
       ON CONFLICT(content_type,id) DO UPDATE SET title=EXCLUDED.title,payload=EXCLUDED.payload,updated_at=NOW()
       RETURNING payload`,
      [id, type, title, JSON.stringify(payload)]
    );
    if (type === 'courses') {
      const c = courseRow(payload);
      await client.query(
        `INSERT INTO courses(id,title,slug,description,level,course_type,access_plans,metadata)
         VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)
         ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,slug=EXCLUDED.slug,description=EXCLUDED.description,
         level=EXCLUDED.level,course_type=EXCLUDED.course_type,access_plans=EXCLUDED.access_plans,metadata=EXCLUDED.metadata,updated_at=NOW()`,
        [c.id,c.title,c.slug,c.description,c.level,c.courseType,JSON.stringify(c.accessPlans),JSON.stringify(c.metadata)]
      );
      const lessons=Array.isArray(payload.lessons)?payload.lessons:[];
      for(let i=0;i<lessons.length;i++){
        const l=lessons[i]||{}, lessonId=String(l.id||`${c.id}_lesson_${i+1}`), videoMeta=l.videoMeta||{};
        await client.query(`INSERT INTO lessons(id,course_id,title,position,video_key,video_duration_seconds,metadata)
          VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)
          ON CONFLICT(id) DO UPDATE SET course_id=EXCLUDED.course_id,title=EXCLUDED.title,position=EXCLUDED.position,video_key=EXCLUDED.video_key,video_duration_seconds=EXCLUDED.video_duration_seconds,metadata=EXCLUDED.metadata,updated_at=NOW()`,
          [lessonId,c.id,String(l.title||`جلسه ${i+1}`),i+1,videoMeta.filename||l.videoKey||l.video||null,Number(l.durationSeconds)||null,JSON.stringify({...l,videoMeta})]);
      }
      const ids=lessons.map((l,i)=>String(l?.id||`${c.id}_lesson_${i+1}`));
      if(ids.length) await client.query('DELETE FROM lessons WHERE course_id=$1 AND NOT (id = ANY($2::text[]))',[c.id,ids]);
      else await client.query('DELETE FROM lessons WHERE course_id=$1',[c.id]);
    }
    await client.query('COMMIT');
    return r.rows[0].payload;
  } catch(e){await client.query('ROLLBACK');throw e} finally {client.release()}
}

async function remove(type, id) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const r = await client.query('DELETE FROM content_items WHERE content_type=$1 AND id=$2 RETURNING id', [type, String(id)]);
    if (type === 'courses') await client.query('DELETE FROM courses WHERE id=$1', [String(id)]);
    await client.query('COMMIT');
    return r.rowCount > 0;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { seedLegacyContent, all, get, save, remove, legacy };
