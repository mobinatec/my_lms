const coursesDb=require('../courses/courses.service');
const {getPool}=require('../../infra/database');
const analytics=require('../analytics/analytics.service');
const auth=require('../auth/auth.service');
const id=p=>`${p}_${Date.now()}_${Math.random().toString(16).slice(2,7)}`;
async function courses(){return coursesDb.getAll()}
async function course(courseId){return coursesDb.getById(courseId)}
async function resolveUser(userId){const r=await getPool().query('SELECT id,legacy_id,name,username FROM users WHERE legacy_id=$1 OR id::text=$1 LIMIT 1',[String(userId)]);return r.rows[0]||null}
async function enroll(userId,courseId,plan){
  const c=await course(courseId); if(!c) throw Error('دوره یافت نشد');
  if(c.allowedPlans?.length){const subs=require('../subscriptions/subscriptions.service');const access=await subs.accessForCourse(userId,c);if(!access.allowed)throw Error(access.message)}
  const u=await resolveUser(userId); if(!u) throw Error('کاربر یافت نشد');
  const existing=await getPool().query(`SELECT id,user_id AS "userId",course_id AS "courseId",plan_key AS plan,status,progress,progress_updated_at AS "progressUpdatedAt",enrolled_at AS "createdAt" FROM enrollments WHERE user_id=$1 AND course_id=$2`,[u.id,courseId]);
  if(existing.rowCount) return existing.rows[0];
  const r=await getPool().query(`INSERT INTO enrollments(user_id,course_id,plan_key,status) VALUES($1,$2,$3,'active') RETURNING id,user_id AS "userId",course_id AS "courseId",plan_key AS plan,status,enrolled_at AS "createdAt"`,[u.id,courseId,plan||'free']);
  await analytics.log({userId:u.legacy_id,role:'user',action:'enroll',entity:'course',entityId:courseId,meta:{plan:plan||'free'}}); return r.rows[0];
}
async function updateProgress(userId,enrollmentId,progress){
  const u=await resolveUser(userId);if(!u)return null;const value=Math.max(0,Math.min(100,Number(progress)||0));
  const r=await getPool().query(`SELECT id FROM enrollments WHERE id=$1 AND user_id=$2`,[enrollmentId,u.id]);if(!r.rowCount)return null;
  const courseRow=await getPool().query('SELECT course_id FROM enrollments WHERE id=$1',[enrollmentId]);
  const q=await getPool().query(`UPDATE enrollments SET progress=$2,progress_updated_at=NOW(),status='active' WHERE id=$1 RETURNING id,user_id AS "userId",course_id AS "courseId",plan_key AS plan,status,progress,progress_updated_at AS "progressUpdatedAt",enrolled_at AS "createdAt"`,[enrollmentId,value]);
  // Course-level progress is retained in the existing enrollment contract; detailed lesson progress is stored separately when lessons are introduced.
  const out={...q.rows[0],progress:value,progressUpdatedAt:new Date().toISOString()};
  await analytics.log({userId:u.legacy_id,role:'user',action:'progress_update',entity:'enrollment',entityId:enrollmentId,meta:{progress:value,courseId:courseRow.rows[0]?.course_id}});return out;
}
async function allEnrollments(){const r=await getPool().query(`SELECT e.id,e.user_id AS "userId",u.legacy_id AS "legacyUserId",e.course_id AS "courseId",e.plan_key AS plan,e.status,e.progress,e.progress_updated_at AS "progressUpdatedAt",e.enrolled_at AS "createdAt" FROM enrollments e JOIN users u ON u.id=e.user_id ORDER BY e.enrolled_at DESC`);return r.rows}
async function myEnrollments(userId){const u=await resolveUser(userId);if(!u)return [];const rows=await getPool().query(`SELECT e.id,e.user_id AS "userId",e.course_id AS "courseId",e.plan_key AS plan,e.status,e.progress,e.progress_updated_at AS "progressUpdatedAt",e.enrolled_at AS "createdAt" FROM enrollments e WHERE e.user_id=$1 ORDER BY e.enrolled_at DESC`,[u.id]);return Promise.all(rows.rows.map(async e=>({...e,course:await course(e.courseId)})))}
async function review(userId,courseId,rating,text,guest={}){
  const u=userId?await resolveUser(userId):null;const guestName=String(guest.name||'').trim();const parts=guestName.split(/\s+/);const first=parts.shift()||'مهمان';const last=parts.join(' ')||'مهمان';
  const r=await getPool().query(`INSERT INTO reviews(course_id,user_id,first_name,last_name,email,mobile,rating,body,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING id,course_id AS "courseId",user_id AS "userId",first_name AS "firstName",last_name AS "lastName",email,mobile,rating,body AS text,status,created_at AS "createdAt"`,[courseId,u?.id||null,first,last,guest.email||null,guest.mobile||null,Number(rating)||5,String(text||'').trim()]);
  await analytics.log({userId:u?.legacy_id||'guest',role:u?'user':'guest',action:'review_submitted',entity:'course',entityId:courseId});return r.rows[0];
}
async function reviews(courseId){const r=await getPool().query(`SELECT r.id,r.course_id AS "courseId",r.user_id AS "userId",r.first_name,r.last_name,r.email,r.mobile,r.rating,r.body AS text,r.status,r.created_at AS "createdAt",COALESCE(u.name,concat(r.first_name,' ',r.last_name)) AS "userName" FROM reviews r LEFT JOIN users u ON u.id=r.user_id WHERE r.course_id=$1 AND r.status='approved' ORDER BY r.created_at DESC`,[courseId]);return r.rows}
async function allReviews(){const r=await getPool().query(`SELECT r.id,r.course_id AS "courseId",r.user_id AS "userId",r.first_name,r.last_name,r.email,r.mobile,r.rating,r.body AS text,r.status,r.assigned_to AS "assignedTo",r.created_at AS "createdAt",COALESCE(u.name,concat(r.first_name,' ',r.last_name)) AS "userName",c.payload->>'title' AS "courseTitle",a.name AS "assignedName" FROM reviews r LEFT JOIN users u ON u.id=r.user_id LEFT JOIN users a ON a.id=r.assigned_to LEFT JOIN content_items c ON c.content_type='courses' AND c.id=r.course_id ORDER BY r.created_at DESC`);return r.rows}
async function updateReview(reviewId,patch){const r=await getPool().query(`UPDATE reviews SET status=COALESCE($2,status),assigned_to=COALESCE((SELECT id FROM users WHERE legacy_id=$3 OR id::text=$3 LIMIT 1),assigned_to),updated_at=NOW() WHERE id::text=$1 OR id::text=$1 RETURNING *`,[reviewId,patch.status||null,patch.assignedTo||null]);if(!r.rowCount)return null;await analytics.log({userId:'admin',role:'admin',action:'review_moderated',entity:'review',entityId:reviewId,meta:{status:r.rows[0].status}});return r.rows[0]}
async function assignedReviews(userId){const u=await resolveUser(userId);if(!u)return [];const r=await getPool().query(`SELECT r.id,r.course_id AS "courseId",r.rating,r.body AS text,r.status,r.created_at AS "createdAt",COALESCE(u2.name,r.first_name||' '||r.last_name) AS "userName",c.payload->>'title' AS "courseTitle" FROM reviews r LEFT JOIN users u2 ON u2.id=r.user_id LEFT JOIN content_items c ON c.content_type='courses' AND c.id=r.course_id WHERE r.assigned_to=$1 ORDER BY r.created_at DESC`,[u.id]);return r.rows}
async function message(userId,courseId,text){const u=await resolveUser(userId);if(!u)throw Error('کاربر یافت نشد');const r=await getPool().query(`INSERT INTO messages(id,user_id,course_id,text,status) VALUES($1,$2,$3,$4,'unread') RETURNING id,user_id AS "userId",course_id AS "courseId",text,status,created_at AS "createdAt"`,[id('msg'),u.id,courseId,String(text||'').trim()]);await analytics.log({userId:u.legacy_id,role:'user',action:'message_teacher',entity:'course',entityId:courseId});return r.rows[0]}
async function messages(){const r=await getPool().query(`SELECT m.id,m.user_id AS "userId",u.name AS "userName",m.course_id AS "courseId",c.payload->>'title' AS "courseTitle",m.text,m.status,m.created_at AS "createdAt" FROM messages m JOIN users u ON u.id=m.user_id LEFT JOIN content_items c ON c.content_type='courses' AND c.id=m.course_id ORDER BY m.created_at DESC`);return r.rows}
async function teacherData(userId){const cs=(await courses()).filter(c=>c.teacherId===userId);const ids=new Set(cs.map(c=>c.id));const ms=await messages();return {courses:cs,messages:ms.filter(m=>ids.has(m.courseId))}}
async function updateCourse(id,x){return coursesDb.update(id,x)}
async function createCourse(x){return coursesDb.create({...x,id:x.id||id('c')})}
async function deleteCourse(id){return coursesDb.remove(id)}
module.exports={courses,course,enroll,updateProgress,allEnrollments,myEnrollments,review,reviews,allReviews,updateReview,assignedReviews,message,messages,teacherData,updateCourse,createCourse,deleteCourse};
