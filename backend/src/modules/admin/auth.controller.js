const crypto=require('crypto');
const auth=require('../auth/auth.service');
function equal(a,b){const x=Buffer.from(String(a||''));const y=Buffer.from(String(b||''));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
exports.login=(req,res)=>{
  const {password}=req.body||{};
  const valid=process.env.ADMIN_PASSWORD_HASH?auth.verifyPassword(password,process.env.ADMIN_PASSWORD_HASH):equal(password,process.env.ADMIN_PASSWORD);
  if(!valid)return res.status(401).json({success:false,message:'رمز عبور نادرست است'});
  res.json({success:true,token:auth.signAdminToken(),expiresIn:8*60*60});
};
