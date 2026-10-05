const fs=require('fs');
const service=require('./media.service');
const { enqueueHlsJob, getJobStatus }=require('./queue');

async function upload(req,res,next){
  try {
    if(!req.file)return res.status(400).json({success:false,message:'فایل ویدئو ارسال نشده است'});
    const data=service.saveUpload(req.file);
    await enqueueHlsJob({id:data.id,filename:data.filename,originalName:data.originalName,mime:data.mime});
    res.status(201).json({success:true,data:{...data,status:'queued',hlsUrl:`/media/hls/${data.id}/master.m3u8`}});
  } catch(error){next(error)}
}

async function status(req,res,next){
  try{
    const data=await getJobStatus(req.params.id);
    if(!data)return res.status(404).json({success:false,message:'وضعیت پردازش پیدا نشد'});
    res.json({success:true,data});
  }catch(error){next(error)}
}

function stream(req,res){const file=service.filePath(req.params.filename);if(!fs.existsSync(file))return res.status(404).json({success:false,message:'فایل پیدا نشد'});const stat=fs.statSync(file);const size=stat.size;const range=req.headers.range;const ext=req.params.filename.toLowerCase().split('.').pop();const mime=ext==='webm'?'video/webm':ext==='ogg'?'video/ogg':'video/mp4';res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Type',mime);if(!range){res.setHeader('Content-Length',size);return fs.createReadStream(file).pipe(res)}const [startText,endText]=range.replace(/bytes=/,'').split('-');const start=parseInt(startText,10)||0;const end=endText?Math.min(parseInt(endText,10),size-1):size-1;if(start>=size||start>end)return res.status(416).set('Content-Range',`bytes */${size}`).end();res.status(206).set({'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1}).end(fs.createReadStream(file,{start,end}))}

module.exports={upload,stream,status};
