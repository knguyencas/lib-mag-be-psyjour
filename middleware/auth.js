const authService = require('../services/auth.service');
const ApiError = require('../utils/apiError');

module.exports = async function(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    const userId = await authService.verifyToken(token);
    
    req.userId = userId;
    
    next();
  } catch (error) {
    next(error);
  }
};