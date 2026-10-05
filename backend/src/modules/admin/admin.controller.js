const asyncHandler=require('../../utils/asyncHandler');
const s=require('./admin.service');
const adminStore=require('./admin.service');
const portfolio=adminStore.portfolio;
const team=adminStore.team;
const services=adminStore.services;
const blog=adminStore.blog;
const coursesService=require('../courses/courses.service');
const mediaAdmin=require('../media/admin.service');
const notifyAdmin=require('./notifications.admin');
const resource=(service)=>({
 list:asyncHandler(async(req,res)=>res.json({success:true,data:await (service.getAll?service.getAll(req.query||{}):service.all())})),
 create:asyncHandler(async(req,res)=>res.status(201).json({success:true,data:await service.create(req.body||{})})),
 update:asyncHandler(async(req,res)=>{const x=await service.update(req.params.id,req.body||{});if(!x)return res.status(404).json({success:false});res.json({success:true,data:x})}),
 remove:asyncHandler(async(req,res)=>{if(!(await service.remove(req.params.id)))return res.status(404).json({success:false});res.json({success:true})})
});
const analyticsStats=asyncHandler(async(req,res)=>res.json({success:true,data:await s.analyticsStats()}));
const auditLogs=asyncHandler(async(req,res)=>res.json({success:true,data:await s.auditLogs()}));
const subscriptions=asyncHandler(async(req,res)=>res.json({success:true,data:await s.subscriptionsAll()}));
const orders=asyncHandler(async(req,res)=>res.json({success:true,data:await s.ordersAll()}));
const updateOrder=asyncHandler(async(req,res)=>res.json({success:true,data:await s.updateOrderStatus(req.params.id,req.body||{})}));
const permissions=asyncHandler(async(req,res)=>res.json({success:true,data:await s.permissions()}));
const roles=asyncHandler(async(req,res)=>res.json({success:true,data:await s.roles()}));
const createRole=asyncHandler(async(req,res)=>res.status(201).json({success:true,data:await s.createRole(req.body||{})}));
const updateRole=asyncHandler(async(req,res)=>{const x=await s.updateRole(req.params.key,req.body||{});if(!x)return res.status(404).json({success:false});res.json({success:true,data:x})});
const deleteRole=asyncHandler(async(req,res)=>{if(!(await s.deleteRole(req.params.key)))return res.status(400).json({success:false,message:'نقش سیستمی یا ناموجود است'});res.json({success:true})});
const enrollmentDetails=asyncHandler(async(req,res)=>res.json({success:true,data:await s.enrollmentDetails()}));
const reviews=asyncHandler(async(req,res)=>res.json({success:true,data:await s.reviews()}));
const updateReview=asyncHandler(async(req,res)=>{const x=await s.updateReview(req.params.id,req.body||{});if(!x)return res.status(404).json({success:false});res.json({success:true,data:x})});
const dashboard=asyncHandler(async(req,res)=>res.json({success:true,data:await s.dashboard()}));
const contacts=asyncHandler(async(req,res)=>res.json({success:true,data:await s.contacts()}));
const courses={
 list:asyncHandler(async(req,res)=>res.json({success:true,data:await coursesService.getAll(req.query||{})})),
 create:asyncHandler(async(req,res)=>res.status(201).json({success:true,data:await coursesService.create(req.body||{})})),
 update:asyncHandler(async(req,res)=>{const x=await coursesService.update(req.params.id,req.body||{});if(!x)return res.status(404).json({success:false});res.json({success:true,data:x})}),
 remove:asyncHandler(async(req,res)=>{if(!(await coursesService.remove(req.params.id)))return res.status(404).json({success:false});res.json({success:true})})
};
const media={
  list:asyncHandler(async(req,res)=>res.json({success:true,data:await mediaAdmin.list()})),
  retry:asyncHandler(async(req,res)=>res.json({success:true,data:await mediaAdmin.retry(req.params.id,req.adminUser)})),
  attach:asyncHandler(async(req,res)=>res.json({success:true,data:await mediaAdmin.attach(req.params.id,req.body?.lessonId,req.adminUser)})),
  remove:asyncHandler(async(req,res)=>res.json({success:true,data:await mediaAdmin.remove(req.params.id,req.adminUser)}))
};
const plans=asyncHandler(async(req,res)=>res.json({success:true,data:await s.subscriptionsPlans()}));
const updatePlan=asyncHandler(async(req,res)=>{try{const x=await s.updatePlan(req.params.courseId,req.params.key,req.body||{});res.json({success:true,data:x})}catch(e){res.status(400).json({success:false,message:e.message})}});
const createPlan=asyncHandler(async(req,res)=>{try{const x=await s.createPlan(req.params.courseId,req.body||{});res.status(201).json({success:true,data:x})}catch(e){res.status(400).json({success:false,message:e.message})}});
const deletePlan=asyncHandler(async(req,res)=>{if(!(await s.deletePlan(req.params.courseId,req.params.key)) )return res.status(404).json({success:false});res.json({success:true})});
const loyalty=asyncHandler(async(req,res)=>res.json({success:true,data:{accounts:await notifyAdmin.accounts(),tiers:await notifyAdmin.tiers()}}));
const loyaltyAdjust=asyncHandler(async(req,res)=>res.json({success:true,data:await notifyAdmin.adjust(req.params.userId,req.body?.points,req.body?.description||'اصلاح امتیاز توسط مدیر')}));
const notifications=asyncHandler(async(req,res)=>res.json({success:true,data:{items:await notifyAdmin.notificationList(req.query?.status),stats:await notifyAdmin.notificationStats()}}));
const notificationRules=asyncHandler(async(req,res)=>res.json({success:true,data:await require('../notifications/notifications.service').rules()}));
const updateNotificationRule=asyncHandler(async(req,res)=>{const x=await require('../notifications/notifications.service').updateRule(req.params.key,req.body||{});if(!x)return res.status(404).json({success:false});res.json({success:true,data:x})});
const notificationProviders=asyncHandler(async(req,res)=>res.json({success:true,data:await require('../notifications/notifications.service').providers()}));
const updateNotificationProvider=asyncHandler(async(req,res)=>res.json({success:true,data:await require('../notifications/notifications.service').saveProvider(req.params.key,req.body||{})}));
const paymentProviders=notificationProviders;
const sendEmail=asyncHandler(async(req,res)=>{const {recipient,subject,body}=req.body||{};const recipients=String(recipient||'').split(/[;,\s]+/).map(x=>x.trim()).filter(Boolean);if(!recipients.length||!subject||!body)return res.status(400).json({success:false,message:'گیرنده، موضوع و متن ایمیل الزامی است'});const items=[];for(const to of recipients)items.push(await require('../notifications/notifications.service').queue({channel:'email',eventKey:'admin.compose.email',recipient:to,subject,body,data:{sentBy:req.adminUser?.id||null}}));res.status(201).json({success:true,data:items});});
const siteSettings=asyncHandler(async(req,res)=>res.json({success:true,data:await s.siteSettings.get()}));
const updateSiteSettings=asyncHandler(async(req,res)=>res.json({success:true,data:await s.siteSettings.update(req.body||{})}));
const createUser=asyncHandler(async(req,res)=>res.status(201).json({success:true,data:await s.createUser(req.body||{})}));
const updateUser=asyncHandler(async(req,res)=>{const x=await s.updateUser(req.params.id,req.body||{});if(!x)return res.status(404).json({success:false});res.json({success:true,data:x})});
module.exports={dashboard,orders,updateOrder,media,loyalty,loyaltyAdjust,notifications,notificationRules,updateNotificationRule,notificationProviders,updateNotificationProvider,paymentProviders,sendEmail,siteSettings,updateSiteSettings,analyticsStats,auditLogs,subscriptions,enrollmentDetails,reviews,updateReview,permissions,roles,createRole,updateRole,deleteRole,plans,updatePlan,createPlan,deletePlan,createUser,updateUser,contacts,portfolio:resource(portfolio),team:resource(team),services:resource(services),blog:resource(blog),courses,users:asyncHandler(async(req,res)=>res.json({success:true,data:await s.users()})),messages:asyncHandler(async(req,res)=>res.json({success:true,data:await s.learning.messages()}))};
