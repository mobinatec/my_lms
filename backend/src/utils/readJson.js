const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
  const raw = fs.readFileSync(absolute, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJson, writeJson };
