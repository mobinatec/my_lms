const asyncHandler = require('../../utils/asyncHandler');
const service = require('./contact.service');

function validate(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) errors.push('نام معتبر نیست');
  if (!body.phone || body.phone.trim().length < 8) errors.push('شماره تماس معتبر نیست');
  if (!body.message || body.message.trim().length < 5) errors.push('پیام باید حداقل ۵ کاراکتر باشد');
  return errors;
}

const submit = asyncHandler(async (req, res) => {
  const errors = validate(req.body || {});
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'اطلاعات ارسالی نامعتبر است', errors });
  }
  const entry = await service.create(req.body);
  res.status(201).json({
    success: true,
    message: 'درخواست شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.',
    data: { id: entry.id, createdAt: entry.createdAt },
  });
});

module.exports = { submit };
