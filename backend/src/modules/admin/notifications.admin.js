const {getPool}=require('../../infra/database');
const loyalty=require('../loyalty/loyalty.service');
const notifications=require('../notifications/notifications.service');
async function accounts(){return loyalty.allAccounts()}
async function tiers(){return loyalty.tiers()}
async function adjust(id,points,description){const r=await getPool().query('SELECT id FROM users WHERE legacy_id=$1 OR id::text=$1 LIMIT 1',[String(id)]);if(!r.rowCount)throw Error('کاربر یافت نشد');return loyalty.adjustPoints(r.rows[0].id,points,description)}
async function notificationList(status){return notifications.list({status})}
async function notificationStats(){return notifications.stats()}
module.exports={accounts,tiers,adjust,notificationList,notificationStats};
