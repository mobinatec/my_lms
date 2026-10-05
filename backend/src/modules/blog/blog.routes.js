const express = require('express');
const controller = require('./blog.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);

module.exports = router;
