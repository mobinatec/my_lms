const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { createClient } = require('redis');
const { Pool } = require('pg');
const execFileAsync = promisify(execFile);
const MEDIA_DIR = process.env.MEDIA_DIR || '/app/media';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const DATABASE_URL = process.env.DATABASE_URL;
const QUEUE_KEY = 'codesazan:media:hls:queue';
const qualities = [
  { name:'360p',width:640,height:360,videoBitrate:'800k',maxrate:'900k',bufsize:'1200k',audioBitrate:'96k' },
  { name:'720p',width:1280,height:720,videoBitrate:'2500k',maxrate:'2800k',bufsize:'4000k',audioBitrate:'128k' },
  { name:'1080p',width:1920,height:1080,videoBitrate:'5000k',maxrate:'5500k',bufsize:'7500k',audioBitrate:'192k' }
];
const redis=createClient({url:REDIS_URL});
const db=new Pool({connectionString:DATABASE_URL,max:5});
redis.on('error',e=>console.error('Redis error:',e.message));
async function update(id,patch){const keys=Object.keys(patch);if(!keys.length)return;const vals=[id];const sets=[];keys.forEach((k,i)=>{vals.push(patch[k]);sets.push(`${k}=$${i+2}`)});sets.push('updated_at=NOW()');await db.query(`UPDATE media_jobs SET ${sets.join(',')} WHERE id=$1`,vals);await redis.set(`codesazan:media:hls:status:${id}`,JSON.stringify({id,...patch,updatedAt:new Date().toISOString()}),{EX:604800});}
function inputPath(filename){return path.join(MEDIA_DIR,path.basename(filename));}
function hlsDir(id){return path.join(MEDIA_DIR,'hls',id);}
async function probeDuration(input){
  try {
    const {stdout}=await execFileAsync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',input],{maxBuffer:1024*1024});
    const value=Number.parseFloat(String(stdout).trim());
    return Number.isFinite(value)&&value>0?Math.round(value*1000)/1000:null;
  } catch { return null; }
}
async function transcode(job){
  const input=inputPath(job.filename);const outDir=hlsDir(job.id);
  if(!fs.existsSync(input))throw new Error(`Source file not found: ${input}`);
  const current=await db.query('SELECT attempts,max_attempts FROM media_jobs WHERE id=$1',[job.id]);
  if(!current.rowCount)throw new Error('Media job not found');
  const attempt=Number(current.rows[0].attempts||0)+1;
  const durationSeconds=await probeDuration(input);
  await update(job.id,{status:'processing',progress:0,quality:null,error:null,attempts:attempt,started_at:new Date(),finished_at:null,duration_seconds:durationSeconds});
  fs.mkdirSync(outDir,{recursive:true});
  for(let i=0;i<qualities.length;i++){
    const q=qualities[i],variantDir=path.join(outDir,q.name);fs.mkdirSync(variantDir,{recursive:true});
    const args=['-y','-i',input,'-map','0:v:0','-map','0:a:0?','-vf',`scale=w=${q.width}:h=${q.height}:force_original_aspect_ratio=decrease:force_divisible_by=2`,'-c:v','libx264','-preset','veryfast','-profile:v','main','-crf','23','-b:v',q.videoBitrate,'-maxrate',q.maxrate,'-bufsize',q.bufsize,'-g','120','-keyint_min','120','-sc_threshold','0','-c:a','aac','-b:a',q.audioBitrate,'-ac','2','-ar','48000','-f','hls','-hls_time','6','-hls_playlist_type','vod','-hls_flags','independent_segments','-hls_segment_filename',path.join(variantDir,'segment_%05d.ts'),path.join(variantDir,'index.m3u8')];
    try{await execFileAsync('ffmpeg',args,{maxBuffer:1024*1024*10});}catch(error){throw new Error(`${q.name}: ${(error.stderr||error.message||'ffmpeg failed').slice(-3000)}`)}
    await update(job.id,{status:'processing',progress:Math.round(((i+1)/qualities.length)*90),quality:q.name});
  }
  const master=`#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-INDEPENDENT-SEGMENTS\n#EXT-X-STREAM-INF:BANDWIDTH=996000,AVERAGE-BANDWIDTH=896000,RESOLUTION=640x360,CODECS="avc1.4d401e,mp4a.40.2"\n360p/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=3128000,AVERAGE-BANDWIDTH=2628000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2"\n720p/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=5692000,AVERAGE-BANDWIDTH=5192000,RESOLUTION=1920x1080,CODECS="avc1.640028,mp4a.40.2"\n1080p/index.m3u8\n`;
  fs.writeFileSync(path.join(outDir,'master.m3u8'),master);
  await update(job.id,{status:'ready',progress:100,quality:null,hls_path:`/media/hls/${job.id}/master.m3u8`,finished_at:new Date()});
}
async function ensureDbSchema(){
  for(let attempt=1;attempt<=60;attempt++){
    try{
      await db.query('SELECT 1');
      await db.query('SELECT 1 FROM media_jobs LIMIT 1');
      await db.query('ALTER TABLE media_jobs ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC(12,3)');
      return;
    }catch(e){
      console.log(`⏳ Waiting for Codesazan media schema (${attempt}/60): ${e.message}`);
      await new Promise(r=>setTimeout(r,2000));
    }
  }
  throw new Error('Media database schema was not ready after 120 seconds');
}
async function main(){
  await ensureDbSchema();
  await redis.connect();
  const recover=await db.query(`SELECT id,filename,original_name AS "originalName",mime FROM media_jobs WHERE status IN ('queued','processing') AND attempts < max_attempts ORDER BY created_at ASC`);
  for(const row of recover.rows)await redis.rPush(QUEUE_KEY,JSON.stringify({id:row.id,filename:row.filename,originalName:row.originalName,mime:row.mime}));
  console.log(`✔ Codesazan media worker ready; recovered ${recover.rowCount} job(s)`);
  while(true){const result=await redis.brPop(QUEUE_KEY,0);if(!result?.element)continue;const job=JSON.parse(result.element);try{await transcode(job);console.log(`✔ HLS ready: ${job.id}`)}catch(error){const row=await db.query('SELECT attempts,max_attempts FROM media_jobs WHERE id=$1',[job.id]);const attempts=Number(row.rows[0]?.attempts||0),max=Number(row.rows[0]?.max_attempts||3);const failed=attempts>=max;await update(job.id,{status:failed?'failed':'queued',error:error.message,progress:0,quality:null,finished_at:failed?new Date():null});if(!failed){await new Promise(r=>setTimeout(r,2000));await redis.rPush(QUEUE_KEY,JSON.stringify(job));}console.error(`✖ HLS ${failed?'failed':'retrying'}: ${job.id}`,error.message)}}
}
main().catch(e=>{console.error(e);process.exit(1)});
