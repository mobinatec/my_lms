const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { getPool } = require('../../infra/database');
const subscriptions = require('../subscriptions/subscriptions.service');
const auth = require('../auth/auth.service');

const MEDIA_DIR = process.env.MEDIA_DIR || '/app/media';
const TTL = Math.max(300, Number(process.env.MEDIA_TOKEN_TTL_SECONDS || 7200));
const secret = () => { if(!process.env.AUTH_SECRET) throw new Error('AUTH_SECRET is required'); return String(process.env.AUTH_SECRET); };

function b64(value){return Buffer.from(JSON.stringify(value)).toString('base64url')}
function sign(value){return crypto.createHmac('sha256', secret()).update(value).digest('base64url')}
function issue(payload){const body=b64({...payload,exp:Math.floor(Date.now()/1000)+TTL});return `${body}.${sign(body)}`}
function verify(token){
  try{
    const [body,mac]=String(token||'').split('.');
    if(!body||!mac||!crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(sign(body))))return null;
    const payload=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
    if(!payload.exp||payload.exp<Math.floor(Date.now()/1000))return null;
    return payload;
  }catch{return null}
}

function findSource(mediaId){
  const root=path.resolve(MEDIA_DIR);
  if(!fs.existsSync(root))return null;
  const name=fs.readdirSync(root).find(x=>x.startsWith(`${mediaId}.`));
  return name?{filename:name,file:path.join(root,name)}:null;
}

async function findLesson(filename){
  const p=getPool();
  const r=await p.query(`SELECT l.id,l.course_id AS "courseId",l.video_key AS "videoKey",c.title,c.course_type AS "courseType",c.access_plans AS "accessPlans",c.metadata
    FROM lessons l JOIN courses c ON c.id=l.course_id
    WHERE l.video_key=$1 OR l.video_key=$2 OR l.video_key LIKE $3
    LIMIT 1`,[filename,`/media/${filename}`,`%${filename}`]);
  return r.rows[0]||null;
}

async function resolveUser(req){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'').trim();
  if(!token)return null;
  return auth.me(token);
}

async function issueForRequest(req,mediaId){
  const source=findSource(mediaId);
  if(!source)throw Object.assign(new Error('فایل رسانه پیدا نشد'),{status:404});
  const user=await resolveUser(req);
  const lesson=await findLesson(source.filename);
  if(!lesson)throw Object.assign(new Error('این فایل به هیچ جلسه‌ای متصل نیست'),{status:404});
  if(user?.status==='suspended')throw Object.assign(new Error('حساب کاربری تعلیق شده است'),{status:403});
  let access;
  if(user?.role==='admin'||user?.permissions?.includes('*'))access={allowed:true,plan:'admin'};
  else access=await subscriptions.accessForCourse(user?.legacy_id||user?.id,nullSafeCourse(lesson));
  if(!access.allowed)throw Object.assign(new Error(access.message||'دسترسی پخش این ویدئو مجاز نیست'),{status:403});
  const token=issue({mediaId,filename:source.filename,userId:user?.legacy_id||user?.id||null,lessonId:lesson.id,courseId:lesson.courseId});
  return {token,expiresIn:TTL,lessonId:lesson.id,courseId:lesson.courseId,hlsUrl:`/media/hls/${mediaId}/master.m3u8?token=${encodeURIComponent(token)}`,sourceUrl:`/media/source/${encodeURIComponent(source.filename)}?token=${encodeURIComponent(token)}`};
}
function nullSafeCourse(lesson){return {id:lesson.courseId,courseType:lesson.courseType,allowedPlans:lesson.accessPlans||null}}

function validateMediaToken(token,mediaId){const p=verify(token);return p&&String(p.mediaId)===String(mediaId)?p:null}

module.exports={issueForRequest,validateMediaToken,findSource,findLesson,TTL};
