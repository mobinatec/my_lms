const express = require('express');
const controller = require('./courses.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);

module.exports = router;
