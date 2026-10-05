const asyncHandler = require('../../utils/asyncHandler');
const service = require('./courses.service');
const auth = require('../auth/auth.service');
const subscriptions = require('../subscriptions/subscriptions.service');
const list = asyncHandler(async (req,res)=>{const {level}=req.query;res.json({success:true,count:await service.getAll({level}).length,data:await service.getAll({level})})});
const getOne = asyncHandler(async (req,res)=>{const item=await await service.getById(req.params.id);if(!item)return res.status(404).json({success:false,message:'دوره یافت نشد'});const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');const user=token?await auth.me(token):null;const access=await subscriptions.accessForCourse(user?.id,item);res.json({success:true,data:{...item,access}})});
module.exports={list,getOne};
