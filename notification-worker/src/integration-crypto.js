const crypto=require('crypto');
const key=()=>crypto.createHash('sha256').update(String(process.env.INTEGRATION_CONFIG_KEY||process.env.JWT_SECRET||'codesazan-development-key')).digest();
function seal(value){if(value===undefined||value===null)return value;const iv=crypto.randomBytes(12);const c=crypto.createCipheriv('aes-256-gcm',key(),iv);const enc=Buffer.concat([c.update(String(value),'utf8'),c.final()]);return `enc:${iv.toString('base64')}:${c.getAuthTag().toString('base64')}:${enc.toString('base64')}`}
function open(value){if(typeof value!=='string'||!value.startsWith('enc:'))return value;try{const [,iv,tag,data]=value.split(':');const d=crypto.createDecipheriv('aes-256-gcm',key(),Buffer.from(iv,'base64'));d.setAuthTag(Buffer.from(tag,'base64'));return Buffer.concat([d.update(Buffer.from(data,'base64')),d.final()]).toString('utf8')}catch{return ''}}
function sealConfig(config){const out={};for(const [k,v] of Object.entries(config||{}))out[k]=/pass|password|token|apikey|apiKey|secret|merchantId/i.test(k)&&v&&v!=='********'?seal(v):v;return out}
function openConfig(config){const out={};for(const [k,v] of Object.entries(config||{}))out[k]=open(v);return out}
module.exports={sealConfig,openConfig};
