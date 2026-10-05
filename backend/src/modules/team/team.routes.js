const express=require('express');const c=require('./team.controller');const r=express.Router();r.get('/',c.list);r.get('/:id/resume',c.resume);r.get('/:id',c.one);module.exports=r;
