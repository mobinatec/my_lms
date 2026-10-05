const crypto=require('crypto');
const password=process.argv.slice(2).join(' ');
if(!password){console.error('Usage: node scripts/generate-admin-hash.js "A-strong-password"');process.exit(1)}
const salt=crypto.randomBytes(16);const derived=crypto.scryptSync(password,salt,32,{N:16384,r:8,p:1,maxmem:64*1024*1024});
console.log(`scrypt$16384$8$1$${salt.toString('base64url')}$${derived.toString('base64url')}`);
