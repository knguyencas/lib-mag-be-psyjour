const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError.js');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw ApiError.badRequest('Validation failed', errorMessages);
  }

  next();
};

module.exports = validateRequest;