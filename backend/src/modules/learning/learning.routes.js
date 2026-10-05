const express=require('express');
const s=require('./learning.service');
const coursesDb=require('../courses/courses.service');
const auth=require('../../middlewares/userAuth');
const r=express.Router();

r.get('/courses',async(req,res,next)=>{try{res.json({success:true,data:await coursesDb.getAll(req.query||{})})}catch(e){next(e)}});
r.get('/courses/:id',async(req,res,next)=>{try{const c=await coursesDb.getById(req.params.id);if(!c)return res.status(404).json({success:false});res.json({success:true,data:{...c,reviews:await s.reviews(c.id)}})}catch(e){next(e)}});
r.post('/courses/:id/enroll',auth,async(req,res,next)=>{try{res.status(201).json({success:true,data:await s.enroll(req.user.id,req.params.id,req.body?.plan)})}catch(e){res.status(400).json({success:false,message:e.message})}});
r.post('/teacher/courses',auth,async(req,res,next)=>{try{if(req.user.role!=='teacher'&&req.user.role!=='admin')return res.status(403).json({success:false,message:'دسترسی ثبت دوره مجاز نیست'});const x=await s.createCourse({...req.body,createdBy:req.user.id,teacherId:req.user.id,teacher:req.user.name});res.status(201).json({success:true,data:x})}catch(e){next(e)}});
r.put('/teacher/courses/:id',auth,async(req,res,next)=>{try{const c=await s.course(req.params.id);if(!c)return res.status(404).json({success:false});if(req.user.role!=='admin'&&!(req.user.role==='teacher'&&c.teacherId===req.user.id))return res.status(403).json({success:false,message:'فقط ثبت‌کننده دوره می‌تواند آن را ویرایش کند'});const x=await s.updateCourse(req.params.id,req.body||{});res.json({success:true,data:x})}catch(e){next(e)}});
r.get('/teacher',auth,async(req,res,next)=>{try{if(req.user.role!=='teacher'&&req.user.role!=='admin')return res.status(403).json({success:false,message:'دسترسی مدرس مجاز نیست'});res.json({success:true,data:await s.teacherData(req.user.id)})}catch(e){next(e)}});
r.get('/me/enrollments',auth,async(req,res,next)=>{try{res.json({success:true,data:await s.myEnrollments(req.user.id)})}catch(e){next(e)}});
r.get('/me/reviews/assigned',auth,async(req,res,next)=>{try{res.json({success:true,data:await s.assignedReviews(req.user.id)})}catch(e){next(e)}});
r.put('/enrollments/:id/progress',auth,async(req,res,next)=>{try{const x=await s.updateProgress(req.user.id,req.params.id,req.body?.progress);if(!x)return res.status(404).json({success:false});res.json({success:true,data:x})}catch(e){next(e)}});
r.post('/courses/:id/reviews',auth,async(req,res,next)=>{try{res.status(201).json({success:true,data:await s.review(req.user.id,req.params.id,req.body?.rating,req.body?.text)})}catch(e){next(e)}});
r.post('/courses/:id/guest-reviews',(req,res)=>{const name=String(req.body?.name||'').trim(),text=String(req.body?.text||'').trim(),rating=Number(req.body?.rating);if(name.length<2)return res.status(400).json({success:false,message:'نام و نام خانوادگی را وارد کنید.'});if(!text)return res.status(400).json({success:false,message:'متن نظر را وارد کنید.'});if(!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({success:false,message:'امتیاز باید بین ۱ تا ۵ باشد.'});(async()=>{try{res.status(201).json({success:true,data:await s.review(null,req.params.id,rating,text,{name,email:req.body?.email,mobile:req.body?.mobile})})}catch(e){res.status(400).json({success:false,message:e.message})}})()});
r.post('/courses/:id/messages',auth,async(req,res,next)=>{try{res.status(201).json({success:true,data:await s.message(req.user.id,req.params.id,req.body?.text)})}catch(e){next(e)}});
module.exports=r;
