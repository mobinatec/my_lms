const asyncHandler = require('../../utils/asyncHandler');
const service = require('./team.service');
const list = asyncHandler(async (req,res)=>{const data=await service.getAll();res.json({success:true,count:data.length,data});});
const one = asyncHandler(async (req,res)=>{const item=await await service.getById(req.params.id);if(!item)return res.status(404).json({success:false,message:'عضو تیم یافت نشد'});res.json({success:true,data:item});});
const resume = asyncHandler(async (req,res)=>{const item=await service.getById(req.params.id);if(!item?.resume)return res.status(404).json({success:false,message:'فایل رزومه موجود نیست'});if(/^\/uploads\/public\//.test(String(item.resume))){return res.redirect(item.resume)}const match=String(item.resume).match(/^data:([^;]+);base64,(.+)$/);if(!match)return res.status(400).json({success:false,message:'فرمت فایل رزومه نامعتبر است'});const mime=match[1]||'application/octet-stream';res.setHeader('Content-Type',mime);res.setHeader('Content-Disposition',`attachment; filename="${encodeURIComponent(item.name||'resume')}"`);res.send(Buffer.from(match[2],'base64'));});
module.exports={list,one,resume};
