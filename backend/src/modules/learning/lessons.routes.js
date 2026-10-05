const express=require('express');
const s=require('./lessons.service');
const auth=require('../../middlewares/userAuth');
const r=express.Router();

r.get('/courses/:courseId/lessons',async(req,res,next)=>{try{res.json({success:true,data:await s.list(req.params.courseId)})}catch(e){next(e)}});
r.get('/courses/:courseId/access',auth,async(req,res,next)=>{try{res.json({success:true,data:await s.access(req.user.id,req.params.courseId)})}catch(e){next(e)}});
r.post('/lessons',auth,async(req,res,next)=>{try{res.status(201).json({success:true,data:await s.create(req.user,req.body||{})})}catch(e){res.status(403).json({success:false,message:e.message})}});
r.put('/lessons/:id',auth,async(req,res,next)=>{try{const x=await s.update(req.user,req.params.id,req.body||{});if(!x)return res.status(404).json({success:false});res.json({success:true,data:x})}catch(e){res.status(403).json({success:false,message:e.message})}});
r.delete('/lessons/:id',auth,async(req,res,next)=>{try{res.json({success:true,data:await s.remove(req.user,req.params.id)})}catch(e){res.status(403).json({success:false,message:e.message})}});
r.post('/lessons/:id/progress',auth,async(req,res,next)=>{try{res.json({success:true,data:await s.progress(req.user.id,req.params.id,req.body||{})})}catch(e){res.status(400).json({success:false,message:e.message})}});
r.get('/courses/:courseId/my-progress',auth,async(req,res,next)=>{try{res.json({success:true,data:await s.myProgress(req.user.id,req.params.courseId)})}catch(e){next(e)}});
module.exports=r;
