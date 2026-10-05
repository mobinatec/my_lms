require('dotenv').config();

const nodeEnv=process.env.NODE_ENV||'development';
const production=nodeEnv==='production';
const authSecret=process.env.AUTH_SECRET||'';
if(production && authSecret.length<32) throw new Error('AUTH_SECRET must be at least 32 characters in production');
if(production && !process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_PASSWORD_HASH (preferred) or ADMIN_PASSWORD in production');
module.exports={
 port:Number(process.env.PORT||4000),
 nodeEnv,
 corsOrigin:process.env.CORS_ORIGIN||'http://localhost',
 adminPassword:process.env.ADMIN_PASSWORD||'',
 adminPasswordHash:process.env.ADMIN_PASSWORD_HASH||'',
 databaseUrl:process.env.DATABASE_URL||'',
 redisUrl:process.env.REDIS_URL||'',
 infrastructureRequired:process.env.INFRA_REQUIRED==='true',
 trustProxy:process.env.TRUST_PROXY==='true'?1:Number(process.env.TRUST_PROXY||0),
 jsonLimit:process.env.JSON_LIMIT||'2mb',
 rateLimit:Number(process.env.RATE_LIMIT||240)
};
