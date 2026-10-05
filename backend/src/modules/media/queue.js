const { connectCache } = require('../../infra/cache');
const jobs = require('./jobs');
const QUEUE_KEY = 'codesazan:media:hls:queue';
const STATUS_PREFIX = 'codesazan:media:hls:status:';
async function mirror(id,data){const redis=await connectCache();await redis.set(`${STATUS_PREFIX}${id}`,JSON.stringify(data),{EX:60*60*24*7});}
async function setJobStatus(id,status,extra={}){const data={id,status,updatedAt:new Date().toISOString(),...extra};await mirror(id,data);return jobs.updateJob(id,{status,progress:Number(extra.progress??(status==='ready'?100:0)),quality:extra.quality||null,error:extra.error||null,hls_path:extra.hlsUrl||null,started_at:status==='processing'?new Date():undefined,finished_at:['ready','failed'].includes(status)?new Date():undefined});}
async function enqueueHlsJob(job){await jobs.createJob(job);const redis=await connectCache();await setJobStatus(job.id,'queued',{filename:job.filename,originalName:job.originalName});await redis.rPush(QUEUE_KEY,JSON.stringify(job));}
async function getJobStatus(id){const db=await jobs.getJob(id);if(db)return {...db,updatedAt:db.updated_at};const redis=await connectCache();const raw=await redis.get(`${STATUS_PREFIX}${id}`);return raw?JSON.parse(raw):null;}
async function recoverJobs(){const redis=await connectCache();const rows=await jobs.listRecoverable();for(const row of rows){await redis.rPush(QUEUE_KEY,JSON.stringify({id:row.id,filename:row.filename,originalName:row.original_name,mime:row.mime,attempt:row.attempts}));}return rows.length;}
module.exports={QUEUE_KEY,setJobStatus,enqueueHlsJob,getJobStatus,recoverJobs};
