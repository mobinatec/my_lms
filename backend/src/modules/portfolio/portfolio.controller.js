const asyncHandler = require('../../utils/asyncHandler');
const service = require('./portfolio.service');

const list = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const items = await service.getAll({ category });
  res.json({ success: true, count: items.length, data: items });
});

const getOne = asyncHandler(async (req, res) => {
  const item = await await service.getById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'نمونه‌کار یافت نشد' });
  }
  res.json({ success: true, data: item });
});

module.exports = { list, getOne };
