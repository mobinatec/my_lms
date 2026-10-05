const { getPool } = require('../../infra/database');

async function createJob(data) {
  const p = getPool();
  const r = await p.query(`INSERT INTO media_jobs(id,filename,original_name,mime,status,progress,max_attempts)
    VALUES($1,$2,$3,$4,'queued',0,$5)
    ON CONFLICT(id) DO UPDATE SET filename=EXCLUDED.filename,original_name=EXCLUDED.original_name,mime=EXCLUDED.mime,updated_at=NOW()
    RETURNING *`, [data.id,data.filename,data.originalName||null,data.mime||null,Number(data.maxAttempts||3)]);
  return r.rows[0];
}
async function getJob(id){ const r=await getPool().query('SELECT * FROM media_jobs WHERE id=$1',[id]); return r.rows[0]||null; }
async function updateJob(id,patch={}) {
  const fields=Object.keys(patch); if(!fields.length)return getJob(id);
  const values=[id]; const sets=[];
  fields.forEach((key,i)=>{ values.push(patch[key]); sets.push(`${key}=$${i+2}`); });
  sets.push('updated_at=NOW()');
  const r=await getPool().query(`UPDATE media_jobs SET ${sets.join(',')} WHERE id=$1 RETURNING *`,values);
  return r.rows[0]||null;
}
async function listRecoverable(){
  const r=await getPool().query(`SELECT * FROM media_jobs WHERE status IN ('queued','processing') AND attempts < max_attempts ORDER BY created_at ASC`);
  return r.rows;
}
module.exports={createJob,getJob,updateJob,listRecoverable};
