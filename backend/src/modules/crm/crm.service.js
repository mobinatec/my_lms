const {getPool}=require('../../infra/database'); const analytics=require('../analytics/analytics.service');
async function list(){const r=await getPool().query(`SELECT c.*,u.username AS owner_username,(SELECT COUNT(*) FROM tickets t WHERE t.contact_id=c.id)::int AS ticket_count,(SELECT COUNT(*) FROM crm_activities a WHERE a.contact_id=c.id)::int AS activity_count FROM crm_contacts c LEFT JOIN users u ON u.id=c.owner_id ORDER BY c.updated_at DESC`);return r.rows}
async function resolveUser(id){if(!id)return null;const r=await getPool().query('SELECT id FROM users WHERE id::text=$1 OR legacy_id=$1 LIMIT 1',[id]);return r.rows[0]?.id||null}
async function create(x,admin){
 const pool=getPool();const owner=await resolveUser(x.ownerId);let userId=null;
 if(String(x.type||'lead')==='customer'){
  const username=String(x.username||'').trim().toLowerCase(),password=String(x.password||'');
  if(username.length<3)throw Object.assign(new Error('برای مشتری، نام کاربری حداقل ۳ کاراکتر لازم است.'),{status:422});
  if(password.length<8)throw Object.assign(new Error('برای مشتری، رمز عبور حداقل ۸ کاراکتر لازم است.'),{status:422});
  if(!String(x.email||'').trim())throw Object.assign(new Error('برای ایجاد حساب مشتری، ایمیل الزامی است.'),{status:422});
  const exists=await pool.query('SELECT 1 FROM users WHERE LOWER(username)=LOWER($1) OR LOWER(email)=LOWER($2) LIMIT 1',[username,String(x.email).trim().toLowerCase()]);
  if(exists.rowCount)throw Object.assign(new Error('نام کاربری یا ایمیل مشتری قبلاً استفاده شده است.'),{status:409});
  const auth=require('../auth/auth.service');const crypto=require('crypto');
  const ur=await pool.query(`INSERT INTO users(legacy_id,username,email,name,phone,password_hash,role_key,permissions,status,profile) VALUES($1,$2,$3,$4,$5,$6,'user',$7::jsonb,'active','{}'::jsonb) RETURNING id`,[`u_${crypto.randomUUID()}`,username,String(x.email).trim().toLowerCase(),x.name,String(x.phone||''),auth.hashPassword(password),JSON.stringify(['profile.edit','courses.view'])]);
  userId=ur.rows[0].id;
 }
 const r=await pool.query(`INSERT INTO crm_contacts(name,company,email,phone,type,status,source,owner_id,user_id,tags,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11) RETURNING *`,[x.name,x.company||'',x.email||'',x.phone||'',x.type||'lead',x.status||'new',x.source||'',owner,userId,JSON.stringify(x.tags||[]),x.notes||'']);
 await analytics.log({role:'admin',action:'crm_contact_created',entity:'crm_contact',entityId:r.rows[0].id,meta:{by:admin?.id,userId}});return r.rows[0]}
async function update(id,x,admin){
 const pool=getPool();const current=(await pool.query('SELECT * FROM crm_contacts WHERE id=$1',[id])).rows[0];if(!current)return null;const owner=await resolveUser(x.ownerId);let userId=current.user_id||null;
 if(String(x.type||current.type)==='customer'){
  const username=String(x.username??'').trim().toLowerCase(),password=String(x.password||'');
  if(username.length<3)throw Object.assign(new Error('برای مشتری، نام کاربری حداقل ۳ کاراکتر لازم است.'),{status:422});
  if(password&&password.length<8)throw Object.assign(new Error('رمز عبور جدید مشتری باید حداقل ۸ کاراکتر باشد.'),{status:422});
  if(!userId){
   if(!password)throw Object.assign(new Error('برای مشتری جدید باید رمز عبور تعیین شود.'),{status:422});
   if(!String(x.email||current.email||'').trim())throw Object.assign(new Error('برای ایجاد حساب مشتری، ایمیل الزامی است.'),{status:422});
   const exists=await pool.query('SELECT 1 FROM users WHERE LOWER(username)=LOWER($1) OR LOWER(email)=LOWER($2) LIMIT 1',[username,String(x.email||current.email).trim().toLowerCase()]);
   if(exists.rowCount)throw Object.assign(new Error('نام کاربری یا ایمیل مشتری قبلاً استفاده شده است.'),{status:409});
   const auth=require('../auth/auth.service');const crypto=require('crypto');const ur=await pool.query(`INSERT INTO users(legacy_id,username,email,name,phone,password_hash,role_key,permissions,status,profile) VALUES($1,$2,$3,$4,$5,$6,'user',$7::jsonb,'active','{}'::jsonb) RETURNING id`,[`u_${crypto.randomUUID()}`,username,String(x.email||current.email).trim().toLowerCase(),x.name,String(x.phone||current.phone||''),auth.hashPassword(password),JSON.stringify(['profile.edit','courses.view'])]);userId=ur.rows[0].id;
  }else{
   const dup=await pool.query('SELECT 1 FROM users WHERE LOWER(username)=LOWER($1) AND id<>$2 LIMIT 1',[username,userId]);if(dup.rowCount)throw Object.assign(new Error('این نام کاربری مشتری قبلاً استفاده شده است.'),{status:409});
   const auth=require('../auth/auth.service');await pool.query(`UPDATE users SET username=$1,email=$2,name=$3,phone=$4,password_hash=CASE WHEN $5='' THEN password_hash ELSE $6 END,updated_at=NOW() WHERE id=$7`,[username,String(x.email||current.email||'').trim().toLowerCase(),x.name,String(x.phone||current.phone||''),password,password?auth.hashPassword(password):'',userId]);
  }
 }
 const r=await pool.query(`UPDATE crm_contacts SET name=$1,company=$2,email=$3,phone=$4,type=$5,status=$6,source=$7,owner_id=$8,user_id=$9,tags=$10::jsonb,notes=$11,updated_at=NOW() WHERE id=$12 RETURNING *`,[x.name,x.company||'',x.email||'',x.phone||'',x.type||'lead',x.status||'new',x.source||'',owner,userId,JSON.stringify(x.tags||[]),x.notes||'',id]);return r.rows[0]||null}
async function remove(id){return (await getPool().query('DELETE FROM crm_contacts WHERE id=$1',[id])).rowCount>0}
async function activities(contactId){return (await getPool().query(`SELECT a.*,u.username AS author FROM crm_activities a LEFT JOIN users u ON u.id=a.created_by WHERE a.contact_id=$1 ORDER BY a.created_at DESC`,[contactId])).rows}
async function dashboard(){
 const db=getPool();
 const [tot,types,statuses,owners,acts,openTickets]=await Promise.all([
  db.query(`SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE type='lead')::int AS leads,COUNT(*) FILTER(WHERE type='customer')::int AS customers,COUNT(*) FILTER(WHERE type='partner')::int AS partners,COUNT(*) FILTER(WHERE created_at>=NOW()-INTERVAL '30 days')::int AS new_30d FROM crm_contacts`),
  db.query(`SELECT type,COUNT(*)::int AS count FROM crm_contacts GROUP BY type ORDER BY count DESC`),
  db.query(`SELECT status,COUNT(*)::int AS count FROM crm_contacts GROUP BY status ORDER BY count DESC`),
  db.query(`SELECT COALESCE(u.username,'تعیین نشده') AS owner,COUNT(*)::int AS count FROM crm_contacts c LEFT JOIN users u ON u.id=c.owner_id GROUP BY u.username ORDER BY count DESC LIMIT 8`),
  db.query(`SELECT type,COUNT(*)::int AS count FROM crm_activities WHERE created_at>=NOW()-INTERVAL '30 days' GROUP BY type ORDER BY count DESC`),
  db.query(`SELECT COUNT(*)::int AS count FROM tickets WHERE status NOT IN ('closed','resolved')`)
 ]);
 return {summary:tot.rows[0],types:types.rows,statuses:statuses.rows,owners:owners.rows,activities:acts.rows,openTickets:openTickets.rows[0]?.count||0};
}
async function timeline(contactId){
 const db=getPool();
 const [a,t]=await Promise.all([
  db.query(`SELECT a.id,a.type,a.subject,a.body,a.due_at,a.completed_at,a.created_at,u.username AS author,'activity' AS source FROM crm_activities a LEFT JOIN users u ON u.id=a.created_by WHERE a.contact_id=$1`,[contactId]),
  db.query(`SELECT t.id,'ticket' AS source,t.subject,t.description AS body,t.status,t.priority,t.created_at,NULL::timestamptz AS due_at,NULL::timestamptz AS completed_at,u.username AS author FROM tickets t LEFT JOIN users u ON u.id=t.assignee_id WHERE t.contact_id=$1`,[contactId])
 ]);
 return [...a.rows,...t.rows].sort((x,y)=>new Date(y.created_at)-new Date(x.created_at));
}
async function addActivity(contactId,x,admin){return (await getPool().query(`INSERT INTO crm_activities(contact_id,type,subject,body,due_at,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,[contactId,x.type||'note',x.subject||'',x.body||'',x.dueAt||null,admin?.id&&admin.id!=='admin-token'?admin.id:null])).rows[0]}
module.exports={list,create,update,remove,activities,addActivity,dashboard,timeline};
