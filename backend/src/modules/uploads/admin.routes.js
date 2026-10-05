const express = require('express');
const multer = require('multer');
const fs = require('fs');
const adminAuth = require('../../middlewares/adminAuth');
const service = require('./uploads.service');
const r = express.Router();
const TMP = '/tmp/codesazan-admin-uploads';
fs.mkdirSync(TMP, { recursive: true });
const upload = multer({ dest: TMP, limits: { fileSize: service.FILE_MAX } });
const p = adminAuth.requirePermission;
r.use(adminAuth);

r.post('/profile-image', p('users.manage'), upload.single('file'), (req,res,next)=>{
  try { res.status(201).json({success:true,data:{...service.moveToPublic(req.file,{imageOnly:true}),kind:'profile-image'}}); } catch(e){next(e)}
});
r.post('/site-icon', p('site-settings.manage'), upload.single('file'), (req,res,next)=>{
  try { res.status(201).json({success:true,data:{...service.moveToPublic(req.file,{imageOnly:true}),kind:'site-icon'}}); } catch(e){next(e)}
});
r.post('/file', p('users.manage'), upload.single('file'), (req,res,next)=>{
  try { res.status(201).json({success:true,data:{...service.moveToPrivate(req.file),kind:'private-file'}}); } catch(e){next(e)}
});
r.post('/public-file', p('users.manage'), upload.single('file'), (req,res,next)=>{
  try { res.status(201).json({success:true,data:{...service.moveToPublic(req.file),kind:'public-file'}}); } catch(e){next(e)}
});
module.exports = r;
