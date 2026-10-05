const asyncHandler = require('../../utils/asyncHandler');
const service = require('./services.service');

const list = asyncHandler(async (req, res) => {
  const items = await service.getAll();
  res.json({ success: true, count: items.length, data: items });
});

module.exports = { list };
