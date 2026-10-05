const express=require('express');const auth=require('../../middlewares/userAuth');const s=require('./notifications.service');const r=express.Router();r.use(auth);
r.get('/',async(req,res,next)=>{try{res.json({success:true,data:await s.my(req.user.id,{unreadOnly:req.query?.unread==='1'})})}catch(e){next(e)}});
r.post('/:id/read',async(req,res,next)=>{try{res.json({success:true,data:await s.markRead(req.user.id,req.params.id)})}catch(e){next(e)}});
r.post('/read-all',async(req,res,next)=>{try{res.json({success:true,data:{count:await s.markAllRead(req.user.id)}})}catch(e){next(e)}});
module.exports=r;
