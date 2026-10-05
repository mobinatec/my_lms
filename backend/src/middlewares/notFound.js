function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.originalUrl} یافت نشد`,
  });
}

module.exports = notFound;
