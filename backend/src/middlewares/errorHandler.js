module.exports=(err,req,res,next)=>{
  if(err?.code==='LIMIT_FILE_SIZE'){
    try{if(req.file?.path)require('fs').unlinkSync(req.file.path)}catch{}
    return res.status(413).json({success:false,message:'حجم فایل بیش از حد مجاز است.',requestId:req.id});
  }
  const status=Number(err?.statusCode||err?.status||500);
  if(status>=500) console.error(`[${req.id||'-'}]`,err);
  const message=status>=500 && process.env.NODE_ENV==='production'?'خطای داخلی سرور':(err?.message||'خطای داخلی سرور');
  res.status(status).json({success:false,message,requestId:req.id});
};
