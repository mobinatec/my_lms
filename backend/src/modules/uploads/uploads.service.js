const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(process.env.MEDIA_DIR || '/app/media', 'uploads');
const PUBLIC = path.join(ROOT, 'public');
const PRIVATE = path.join(ROOT, 'private');
fs.mkdirSync(PUBLIC, { recursive: true });
fs.mkdirSync(PRIVATE, { recursive: true });

const IMAGE_MAX = Number(process.env.IMAGE_MAX_UPLOAD_BYTES || 10 * 1024 * 1024);
const FILE_MAX = Number(process.env.FILE_MAX_UPLOAD_BYTES || 25 * 1024 * 1024);

function safeExt(originalName, mime) {
  const ext = path.extname(originalName || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  if (ext && ext.length <= 12) return ext;
  const map = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp',
    'image/svg+xml': '.svg', 'image/avif': '.avif', 'image/bmp': '.bmp', 'image/tiff': '.tiff',
    'application/pdf': '.pdf', 'text/plain': '.txt', 'application/zip': '.zip'
  };
  return map[mime] || '';
}

function publicUrl(filename) { return `/uploads/public/${encodeURIComponent(filename)}`; }
function isImage(file) { return /^image\//i.test(file?.mimetype || ''); }

function moveToPublic(file, { imageOnly = false } = {}) {
  if (!file) throw Object.assign(new Error('فایل ارسال نشده است'), { statusCode: 400 });
  if (imageOnly && !isImage(file)) throw Object.assign(new Error('فایل باید یک تصویر معتبر باشد'), { statusCode: 400 });
  const max = imageOnly ? IMAGE_MAX : FILE_MAX;
  if (Number(file.size || 0) > max) throw Object.assign(new Error(`حجم فایل بیش از حد مجاز است. سقف ${Math.round(max / 1024 / 1024)} مگابایت است.`), { statusCode: 400 });
  const id = crypto.randomUUID();
  const filename = `${id}${safeExt(file.originalname, file.mimetype)}`;
  const target = path.join(PUBLIC, filename);
  fs.renameSync(file.path, target);
  return { filename, originalName: file.originalname, mime: file.mimetype || 'application/octet-stream', size: file.size, url: publicUrl(filename) };
}

function moveToPrivate(file) {
  if (!file) throw Object.assign(new Error('فایل ارسال نشده است'), { statusCode: 400 });
  if (Number(file.size || 0) > FILE_MAX) throw Object.assign(new Error(`حجم فایل بیش از حد مجاز است. سقف ${Math.round(FILE_MAX / 1024 / 1024)} مگابایت است.`), { statusCode: 400 });
  const id = crypto.randomUUID();
  const filename = `${id}${safeExt(file.originalname, file.mimetype)}`;
  const target = path.join(PRIVATE, filename);
  fs.renameSync(file.path, target);
  return { fileId: filename, originalName: file.originalname, mime: file.mimetype || 'application/octet-stream', size: file.size };
}

function removePublic(url) {
  const filename = String(url || '').split('/').pop();
  if (!filename || filename.includes('..')) return false;
  const target = path.join(PUBLIC, filename);
  if (!target.startsWith(PUBLIC + path.sep)) return false;
  try { fs.unlinkSync(target); return true; } catch { return false; }
}

function filePath(filename) { const name = path.basename(String(filename || '')); return path.join(PUBLIC, name); }
function privateFilePath(filename) { const name = path.basename(String(filename || '')); return path.join(PRIVATE, name); }

module.exports = { ROOT, PUBLIC, PRIVATE, IMAGE_MAX, FILE_MAX, moveToPublic, moveToPrivate, removePublic, filePath, privateFilePath, publicUrl };
