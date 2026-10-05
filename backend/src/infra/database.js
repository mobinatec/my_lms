const { Pool } = require('pg');
let pool=null;
function getPool(){if(!pool){pool=new Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.DB_POOL_MAX||20),idleTimeoutMillis:30000,connectionTimeoutMillis:5000,statement_timeout:Number(process.env.DB_STATEMENT_TIMEOUT_MS||30000),query_timeout:Number(process.env.DB_QUERY_TIMEOUT_MS||35000),application_name:'codesazan-backend'});pool.on('error',err=>console.error('PostgreSQL pool error:',err.message));}return pool}
async function checkDatabase(){const result=await getPool().query('SELECT 1 AS ok');return result.rows[0]?.ok===1}
async function closeDatabase(){if(pool)await pool.end();pool=null}
module.exports={getPool,checkDatabase,closeDatabase};
