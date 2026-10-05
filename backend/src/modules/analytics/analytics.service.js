const { getPool } = require('../../infra/database');
async function track({path='/',section='home',userId=null}) {
  const uid = userId ? await getPool().query('SELECT id FROM users WHERE legacy_id=$1 OR id::text=$1 LIMIT 1',[String(userId)]) : {rows:[]};
  const id = `pv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  await getPool().query(`INSERT INTO page_views(id,path,section,user_id) VALUES($1,$2,$3,$4)`,[id,path||'/',section||'home',uid.rows[0]?.id||null]);
  return true;
}
async function log({userId=null,role='guest',action,entity='',entityId='',meta={}}) {
  const uid = userId ? await getPool().query('SELECT id FROM users WHERE legacy_id=$1 OR id::text=$1 LIMIT 1',[String(userId)]) : {rows:[]};
  await getPool().query(`INSERT INTO audit_logs(user_id,action,entity,entity_id,metadata) VALUES($1,$2,$3,$4,$5::jsonb)`,[uid.rows[0]?.id||null,action||'unknown',entity||null,entityId||null,JSON.stringify({role,meta})]);
  return true;
}
async function stats() {
  const p=getPool();
  const [total,days,sections]=await Promise.all([
    p.query('SELECT COUNT(*)::int AS total FROM page_views'),
    p.query('SELECT day,COUNT(*)::int AS views FROM page_views GROUP BY day ORDER BY day DESC LIMIT 30'),
    p.query('SELECT section,COUNT(*)::int AS views FROM page_views GROUP BY section ORDER BY views DESC')
  ]);
  return {total:total.rows[0].total,days:days.rows.reverse(),sections:sections.rows};
}
async function logs(){const r=await getPool().query(`SELECT a.id,a.action,a.entity,a.entity_id AS "entityId",a.metadata,a.created_at AS "at",u.legacy_id AS "userId",u.username,u.name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 500`);return r.rows;}
module.exports={track,log,stats,logs};
