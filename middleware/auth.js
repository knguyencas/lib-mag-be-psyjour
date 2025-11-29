const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token is missing');
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.userId = user._id.toString();
    req.userRole = user.role;
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.userRole) {
        throw ApiError.forbidden('No role information');
      }

      if (!allowedRoles.includes(req.userRole)) {
        throw ApiError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  authMiddleware,
  authorizeRoles
};
