const express=require('express');
const s=require('./siteSettings.service');
const r=express.Router();
r.get('/',async(req,res,next)=>{try{res.json({success:true,data:await s.get()})}catch(e){next(e)}});
module.exports=r;
