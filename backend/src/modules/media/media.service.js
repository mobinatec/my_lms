const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const MEDIA_DIR=process.env.MEDIA_DIR||'/app/media';
function safeName(name){return String(name||'video').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-120)}
function ensure(){fs.mkdirSync(MEDIA_DIR,{recursive:true})}
function saveUpload(file){ensure();const ext=path.extname(file.originalname||'').toLowerCase()||'.bin';const id=crypto.randomUUID();const filename=`${id}${ext}`;const target=path.join(MEDIA_DIR,filename);fs.renameSync(file.path,target);return {id,filename,originalName:file.originalname,size:file.size,mime:file.mimetype,url:`/media/${filename}`}}
function filePath(filename){const clean=path.basename(filename);return path.join(MEDIA_DIR,clean)}
module.exports={MEDIA_DIR,safeName,saveUpload,filePath};
