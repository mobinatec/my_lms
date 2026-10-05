const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const authService = require('../auth/auth.service');
const adminAuth = require('../../middlewares/adminAuth');
const service = require('./uploads.service');

const TMP = '/tmp/codesazan-file-uploads';
fs.mkdirSync(TMP, { recursive: true });
const upload = multer({
  dest: TMP,
  limits: { fileSize: service.FILE_MAX },
});

const r = express.Router();
const userAuth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/, '').trim();
    const user = token ? await authService.me(token) : null;
    if (!user) return res.status(401).json({ success: false, message: 'ورود به حساب لازم است' });
    if (user.status === 'suspended') return res.status(403).json({ success: false, message: 'حساب کاربری تعلیق شده است' });
    req.user = user; next();
  } catch (e) { next(e); }
};

r.post('/profile-image', userAuth, upload.single('file'), async (req, res, next) => {
  try {
    const data = service.moveToPublic(req.file, { imageOnly: true });
    res.status(201).json({ success: true, data: { ...data, kind: 'profile-image' } });
  } catch (e) { next(e); }
});

r.post('/file', userAuth, upload.single('file'), async (req, res, next) => {
  try {
    const data = service.moveToPrivate(req.file);
    res.status(201).json({ success: true, data: { ...data, kind: 'private-file' } });
  } catch (e) { next(e); }
});

r.get('/private/:filename', userAuth, (req,res,next)=>{
  try { const target=service.privateFilePath(req.params.filename); if(!fs.existsSync(target)) return res.status(404).end(); res.setHeader('X-Content-Type-Options','nosniff'); res.download(target); } catch(e){next(e)}
});

r.get('/public/:filename', (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const target = service.filePath(filename);
    if (!fs.existsSync(target)) return res.status(404).end();
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(target);
  } catch (e) { next(e); }
});

module.exports = r;
