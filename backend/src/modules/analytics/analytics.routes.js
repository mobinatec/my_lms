const express=require('express');const s=require('./analytics.service');const auth=require('../auth/auth.service');const r=express.Router();
r.post('/track',async(req,res)=>{let userId=null;try{userId=(await auth.me((req.headers.authorization||'').replace(/^Bearer\s+/,'')))?.id||null}catch{}await s.track({path:req.body?.path,section:req.body?.section,userId});res.json({success:true})});
module.exports=r;
