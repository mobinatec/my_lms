const crypto=require('crypto');
const path=require('path');
const {readJson}=require('../../utils/readJson');
const {getPool}=require('../../infra/database');
const analytics=require('../analytics/analytics.service');
const file=path.join(__dirname,'..','..','data','users.json');
const rolesFile=path.join(__dirname,'..','..','data','roles.json');

const SCRYPT_N=16384, SCRYPT_R=8, SCRYPT_P=1, KEYLEN=32;
function hashPassword(password){
  const salt=crypto.randomBytes(16);
  const derived=crypto.scryptSync(String(password),salt,KEYLEN,{N:SCRYPT_N,r:SCRYPT_R,p:SCRYPT_P,maxmem:64*1024*1024});
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}
function safeEqual(a,b){const aa=Buffer.from(String(a));const bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}
function verifyPassword(password,stored){
  if(!stored)return false;
  const parts=String(stored).split('$');
  if(parts[0]==='scrypt'&&parts.length===6){
    try{const [,n,r,p,salt,hash]=parts;const derived=crypto.scryptSync(String(password),Buffer.from(salt,'base64url'),KEYLEN,{N:Number(n),r:Number(r),p:Number(p),maxmem:64*1024*1024});return safeEqual(derived.toString('base64url'),hash)}catch{return false}
  }
  // Backward-compatible verification for v5/v6 records. Successful legacy logins are rehashed below.
  try{return safeEqual(crypto.scryptSync(String(password),'codesazan-salt',32).toString('hex'),String(stored))}catch{return false}
}
const roleDefaults=()=>{try{return readJson(rolesFile)}catch{return[]}};
async function seed(){
  const pool=getPool(), users=readJson(file), roles=roleDefaults();
  for(const r of roles){await pool.query(`INSERT INTO roles(key,title,permissions,is_system) VALUES($1,$2,$3::jsonb,$4) ON CONFLICT(key) DO NOTHING`,[r.key,r.title,JSON.stringify(r.permissions||[]),!!r.system]);}
  const demoPassword=process.env.DEMO_PASSWORD||'';
  const seeds=[['admin','admin@codesazan.local','مدیر سیستم','admin',demoPassword],['employee','employee@codesazan.local','کارمند نمونه','employee',demoPassword],['teacher','teacher@codesazan.local','مدرس نمونه','teacher',demoPassword],['team','team@codesazan.local','عضو تیم نمونه','team',demoPassword],['user','user@codesazan.local','کاربر نمونه','user',demoPassword]];
  const seedDemo=String(process.env.SEED_DEMO_USERS||'false').toLowerCase()==='true';
  if(seedDemo&&!demoPassword)throw new Error('DEMO_PASSWORD is required when SEED_DEMO_USERS=true');
  const seedByUsername=new Map(seeds.map(x=>[x[0],x]));
  const allUsers=seedDemo?[...users]:[];
  if(seedDemo)for(const [username,email,name,role,password] of seeds){if(!allUsers.some(x=>x.username===username||x.email===email))allUsers.push({id:`u_${username}`,username,email,name,role,passwordHash:hashPassword(password)});}
  for(const old of allUsers){
    const seed=seedByUsername.get(old.username);const username=old.username||seed?.[0];if(!username)continue;
    const email=old.email||seed?.[1]||`${username}@codesazan.local`;const name=old.name||seed?.[2]||username;const role=old.role||seed?.[3]||'user';
    const passwordHash=old.passwordHash||(seed?hashPassword(seed[4]):null);if(!passwordHash)continue;const legacyId=old.id||`u_${username}`;
    await pool.query(`INSERT INTO users(legacy_id,username,email,name,phone,password_hash,role_key,permissions,status,profile) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10::jsonb) ON CONFLICT(username) DO NOTHING`,[legacyId,username,email,name,old.phone||'',passwordHash,role,JSON.stringify(old.permissions||[]),old.status||'active',JSON.stringify(old.profile||{})]);
  }
  if(!seedDemo){
    await pool.query(`UPDATE users SET status='suspended',suspension_reason='Demo account disabled in production',updated_at=NOW() WHERE (username IN ('admin','employee','teacher','team','user') OR email LIKE '%@codesazan.local') AND status='active'`);
  }
  const defaultPlans=[['free','رایگان',0,['دسترسی به دوره‌های رایگان','مطالب عمومی سایت','بدون هزینه'],true],['normal','عادی',1490000,['دوره‌های عادی','محتوای آموزشی ویژه','پشتیبانی استاندارد'],false],['vip','VIP',3490000,['همه امکانات عادی','دوره‌های VIP','پشتیبانی ویژه و مزایای VIP'],false]];
  for(const [key,title,price,features,isFree] of defaultPlans)await pool.query(`INSERT INTO plans(key,title,price,features,is_free,active) VALUES($1,$2,$3,$4::jsonb,$5,TRUE) ON CONFLICT(key) DO NOTHING`,[key,title,price,JSON.stringify(features),isFree]);
}
async function findByIdentifier(identifier){const value=String(identifier||'').trim().toLowerCase();const r=await getPool().query('SELECT * FROM users WHERE LOWER(username)=LOWER($1) OR LOWER(email)=LOWER($1) LIMIT 1',[value]);return r.rows[0]||null}
function publicUser(u){return u&&{id:u.legacy_id||u.id,username:u.username,name:u.name,email:u.email,phone:u.phone||'',role:u.role_key||u.role,permissions:u.permissions||[],status:u.status||'active',suspensionReason:u.suspension_reason||u.suspensionReason||'',suspendedUntil:u.suspended_until||u.suspendedUntil||null,profile:u.profile||{}}}
function signClaims(claims,ttlSeconds=8*60*60){const now=Math.floor(Date.now()/1000);const payload=Buffer.from(JSON.stringify({...claims,iat:now,exp:now+ttlSeconds})).toString('base64url');const sig=crypto.createHmac('sha256',process.env.AUTH_SECRET).update(payload).digest('base64url');return `${payload}.${sig}`}
function sign(u,ttl=8*60*60){return signClaims({id:u.id,legacyId:u.legacy_id||u.id,role:u.role_key||u.role,username:u.username,email:u.email},ttl)}
function signAdminToken(ttl=8*60*60){return signClaims({id:'admin-env',role:'admin',username:'admin',permissions:['*'],type:'admin'},ttl)}
function verifyToken(token){try{const [p,s]=String(token||'').split('.');if(!p||!s)return null;const good=crypto.createHmac('sha256',process.env.AUTH_SECRET).update(p).digest('base64url');if(!safeEqual(s,good))return null;const claims=JSON.parse(Buffer.from(p,'base64url').toString());if(!claims.exp||claims.exp<Math.floor(Date.now()/1000))return null;return claims}catch{return null}}
async function register({name,username,email,phone,password}){const exists=await getPool().query('SELECT 1 FROM users WHERE LOWER(email)=LOWER($1) OR LOWER(username)=LOWER($2) LIMIT 1',[email,username]);if(exists.rowCount)throw new Error('نام کاربری یا ایمیل قبلاً ثبت شده است');const role=await getPool().query("SELECT permissions FROM roles WHERE key='user'");const r=await getPool().query(`INSERT INTO users(legacy_id,username,email,name,phone,password_hash,role_key,permissions,status,profile) VALUES($1,$2,$3,$4,$5,$6,'user',$7::jsonb,'active','{}'::jsonb) RETURNING *`,[`u_${crypto.randomUUID()}`,String(username).trim(),String(email).trim().toLowerCase(),name,phone,hashPassword(password),JSON.stringify(role.rows[0]?.permissions||['profile.edit','courses.view'])]);const u=r.rows[0];await analytics.log({userId:u.legacy_id,role:'user',action:'register',entity:'user',entityId:u.legacy_id});return {user:publicUser(u),token:sign(u)}}
async function login(identifier,password){const u=await findByIdentifier(identifier);if(!u||!verifyPassword(password,u.password_hash))return null;if(u.status==='suspended')return {suspended:true,message:'حساب کاربری شما تعلیق شده است',reason:u.suspension_reason||'',until:u.suspended_until||null};if(!String(u.password_hash).startsWith('scrypt$'))await getPool().query('UPDATE users SET password_hash=$1,updated_at=NOW() WHERE id=$2',[hashPassword(password),u.id]);await getPool().query('UPDATE users SET last_login_at=NOW(),updated_at=NOW() WHERE id=$1',[u.id]);await analytics.log({userId:u.legacy_id,role:u.role_key,action:'login',entity:'user',entityId:u.legacy_id});return {user:publicUser(u),token:sign(u)}}
async function me(token){const p=verifyToken(token);if(!p)return null;if(p.type==='admin')return {id:p.id,username:p.username,name:'مدیر سیستم',email:'',role:'admin',permissions:['*'],status:'active'};const r=await getPool().query(`SELECT u.*,r.permissions AS role_permissions,COALESCE((SELECT jsonb_agg(DISTINCT x.permission_key) FROM role_permissions x WHERE x.role_key=u.role_key),'[]'::jsonb) AS role_permission_keys FROM users u LEFT JOIN roles r ON r.key=u.role_key WHERE u.id=$1 OR u.legacy_id=$2 LIMIT 1`,[p.id,p.legacyId||p.id]);const u=r.rows[0];if(!u)return null;const direct=Array.isArray(u.permissions)?u.permissions:[];const role=Array.isArray(u.role_permission_keys)?u.role_permission_keys:(Array.isArray(u.role_permissions)?u.role_permissions:[]);return {...publicUser(u),permissions:[...new Set([...role,...direct])]}}
async function all(){const r=await getPool().query('SELECT * FROM users ORDER BY created_at ASC');return r.rows.map(publicUser)}
async function updateProfile(userId,payload){const r=await getPool().query('SELECT * FROM users WHERE legacy_id=$1 OR id::text=$1 LIMIT 1',[userId]);const u=r.rows[0];if(!u)return null;const profile={...(u.profile||{}),...(payload.profile||{})};const q=await getPool().query(`UPDATE users SET name=$1,phone=$2,email=$3,profile=$4::jsonb,updated_at=NOW() WHERE id=$5 RETURNING *`,[payload.name||u.name,payload.phone||u.phone,payload.email||u.email,JSON.stringify(profile),u.id]);await analytics.log({userId:u.legacy_id,role:u.role_key,action:'profile_update',entity:'user',entityId:u.legacy_id});return publicUser(q.rows[0])}
async function createAdminUser(payload){
 const name=String(payload.name||'').trim();
 const username=String(payload.username||'').trim();
 const email=String(payload.email||'').trim().toLowerCase();
 const password=String(payload.password||'');
 const role=String(payload.role||'user').trim();
 if(name.length<2)throw Object.assign(new Error('نام کاربر الزامی است.'),{status:422});
 if(username.length<3)throw Object.assign(new Error('نام کاربری باید حداقل ۳ کاراکتر باشد.'),{status:422});
 if(!email||!email.includes('@'))throw Object.assign(new Error('ایمیل معتبر الزامی است.'),{status:422});
 if(password.length<8)throw Object.assign(new Error('رمز عبور باید حداقل ۸ کاراکتر باشد.'),{status:422});
 const pool=getPool();
 const roleRow=await pool.query('SELECT key,permissions FROM roles WHERE key=$1 LIMIT 1',[role]);
 if(!roleRow.rowCount)throw Object.assign(new Error('نقش انتخاب‌شده معتبر نیست.'),{status:422});
 const exists=await pool.query('SELECT username,email FROM users WHERE LOWER(username)=LOWER($1) OR LOWER(email)=LOWER($2) LIMIT 1',[username,email]);
 if(exists.rowCount)throw Object.assign(new Error('نام کاربری یا ایمیل قبلاً ثبت شده است.'),{status:409});
 const direct=Array.isArray(payload.permissions)?payload.permissions:[];
 const perms=direct.length?direct:(roleRow.rows[0].permissions||[]);
 const r=await pool.query(`INSERT INTO users(legacy_id,username,email,name,phone,password_hash,role_key,permissions,status,profile) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10::jsonb) RETURNING *`,[`u_${crypto.randomUUID()}`,username,email,name,String(payload.phone||''),hashPassword(password),role,JSON.stringify(perms),payload.status==='suspended'?'suspended':'active',JSON.stringify(payload.profile||{})]);
 const out=publicUser(r.rows[0]);
 await analytics.log({userId:out.id,role:'admin',action:'admin_create_user',entity:'user',entityId:out.id,meta:{role:out.role}});
 return out;
}
async function updateAdminUser(id,payload){
 const r=await getPool().query('SELECT * FROM users WHERE legacy_id=$1 OR id::text=$1 LIMIT 1',[id]);
 const u=r.rows[0];if(!u)return null;
 const username=payload.username===undefined?u.username:String(payload.username||'').trim();
 if(username.length<3)throw Object.assign(new Error('نام کاربری باید حداقل ۳ کاراکتر باشد.'),{status:422});
 const duplicate=await getPool().query('SELECT 1 FROM users WHERE LOWER(username)=LOWER($1) AND id<>$2 LIMIT 1',[username,u.id]);
 if(duplicate.rowCount)throw Object.assign(new Error('این نام کاربری قبلاً استفاده شده است.'),{status:409});
 const profile={...(u.profile||{}),...(payload.profile||{})};
 const password=payload.password===undefined?null:String(payload.password||'');
 if(password!==null&&password.length>0&&password.length<8)throw Object.assign(new Error('رمز عبور جدید باید حداقل ۸ کاراکتر باشد.'),{status:422});
 const passwordHash=password?hashPassword(password):u.password_hash;
 const q=await getPool().query(`UPDATE users SET name=$1,username=$2,email=$3,phone=$4,password_hash=$5,role_key=$6,permissions=$7::jsonb,status=$8,suspension_reason=$9,suspended_until=$10,profile=$11::jsonb,updated_at=NOW() WHERE id=$12 RETURNING *`,[payload.name||u.name,username,payload.email===undefined?u.email:String(payload.email||'').trim().toLowerCase(),payload.phone===undefined?u.phone:String(payload.phone||''),passwordHash,payload.role||u.role_key,JSON.stringify(Array.isArray(payload.permissions)?payload.permissions:(u.permissions||[])),payload.status||u.status,payload.suspensionReason??u.suspension_reason??'',payload.suspendedUntil??u.suspended_until??null,JSON.stringify(profile),u.id]);
 const out=publicUser(q.rows[0]);await analytics.log({userId:out.id,role:'admin',action:out.status==='suspended'?'user_suspended':'admin_update_user',entity:'user',entityId:out.id,meta:{role:out.role,usernameChanged:username!==u.username,passwordChanged:!!password}});return out}

module.exports={seed,register,login,me,verify:verifyToken,all,createAdminUser,updateProfile,updateAdminUser,hashPassword,verifyPassword,signAdminToken};
