const express=require('express');
const path=require('path');
const multer=require('multer');
const fs=require('fs');
const auth=require('../../middlewares/adminAuth');
const requirePermission=auth.requirePermission;
const c=require('./media.controller');
const access=require('./access');
const dir='/tmp/codesazan-uploads';fs.mkdirSync(dir,{recursive:true});
const upload=multer({dest:dir,limits:{fileSize:Number(process.env.MEDIA_MAX_UPLOAD_BYTES||524288000)},fileFilter:(req,file,cb)=>{if(/^video\//.test(file.mimetype))cb(null,true);else cb(new Error('فقط فایل ویدئویی مجاز است'))}});
const r=express.Router();
const optionalAuth=async(req,res,next)=>{try{const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'').trim();if(token)req.adminUser=await require('../../modules/auth/auth.service').me(token);next()}catch(e){next(e)}};

r.get('/access/:mediaId',optionalAuth,async(req,res,next)=>{try{const data=await access.issueForRequest(req,req.params.mediaId);res.json({success:true,data})}catch(e){next(e)}});

async function serveHls(req,res,next){
  try{
    const payload=access.validateMediaToken(req.query.token,req.params.mediaId);
    if(!payload)return res.status(401).end();
    const mediaRoot=path.resolve(process.env.MEDIA_DIR||'/app/media');
    const base=path.resolve(mediaRoot,'hls',req.params.mediaId);
    const requested=req.params.quality==='master'?'master.m3u8':path.join(req.params.quality,req.params.file);
    const target=path.resolve(base,requested);
    if(!target.startsWith(base+path.sep)||!fs.existsSync(target))return res.status(404).end();
    if(!target.toLowerCase().endsWith('.m3u8')){
      res.set('Cache-Control','private, max-age=3600');
      return res.sendFile(target);
    }
    let body=fs.readFileSync(target,'utf8');
    const signed=encodeURIComponent(req.query.token);
    body=body.split(/\r?\n/).map(line=>{
      const trimmed=line.trim();
      if(!trimmed||trimmed.startsWith('#'))return line;
      if(/\.(m3u8|ts|m4s|mp4)$/i.test(trimmed))return `${trimmed}?token=${signed}`;
      return line;
    }).join('\n');
    res.set({'Content-Type':'application/vnd.apple.mpegurl','Cache-Control':'private, no-store'}).send(body);
  }catch(e){next(e)}
}
r.get('/hls/:mediaId/master.m3u8',(req,res,next)=>{req.params.quality='master';serveHls(req,res,next)});
r.get('/hls/:mediaId/:quality/:file',serveHls);

r.get('/source/:filename',async(req,res,next)=>{try{const source=access.findSource(path.basename(req.params.filename));if(!source)return res.status(404).end();const payload=access.validateMediaToken(req.query.token,source.filename.split('.')[0]);if(!payload)return res.status(401).end();return c.stream(req,res)}catch(e){next(e)}});
r.post('/upload',auth,requirePermission('lessons.manage'),upload.single('file'),c.upload);
r.get('/status/:id',auth,requirePermission('lessons.manage'),c.status);
module.exports=r;
