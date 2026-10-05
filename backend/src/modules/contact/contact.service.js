const { getPool } = require('../../infra/database');
const notifications=require('../notifications/notifications.service');
async function create({name,phone,email,subject,message}) {
  const id=`sub_${Date.now()}`;
  const trackingCode=`REQ-${Date.now().toString(36).toUpperCase()}`;
  const r=await getPool().query(`INSERT INTO contact_submissions(id,name,phone,email,subject,message,tracking_code) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,phone,email,subject,message,tracking_code AS "trackingCode",created_at AS "createdAt"`,[id,name,phone,email||null,subject||'درخواست عمومی',message,trackingCode]);
  const row=r.rows[0];
  if(phone||email){const data={trackingCode,relatedType:'contact',relatedId:id};if(phone)await notifications.queue({channel:'sms',eventKey:'contact.received',recipient:phone,data});if(email)await notifications.queue({channel:'email',eventKey:'contact.received.email',recipient:email,data});}
  return row;
}
async function loadAll(){const r=await getPool().query(`SELECT id,name,phone,email,subject,message,created_at AS "createdAt" FROM contact_submissions ORDER BY created_at DESC`);return r.rows;}
module.exports={create,loadAll};
