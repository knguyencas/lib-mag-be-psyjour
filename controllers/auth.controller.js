const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!username || !password) {
        const ApiError = require('../utils/apiError');
        throw ApiError.badRequest('Username and password are required');
      }

      if (username.trim().length < 3) {
        const ApiError = require('../utils/apiError');
        throw ApiError.badRequest('Username must be at least 3 characters');
      }

      if (password.length < 8) {
        const ApiError = require('../utils/apiError');
        throw ApiError.badRequest('Password must be at least 8 characters');
      }

      // Email là optional
      const result = await authService.registerUser(username, email, password);

      res.status(201).json(
        ApiResponse.success(result, 'User registered successfully', 201)
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        const ApiError = require('../utils/apiError');
        throw ApiError.badRequest('Username/email and password are required');
      }

      const result = await authService.loginUser(identifier, password);

      res.json(
        ApiResponse.success(result, 'Login successful')
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/profile
  async getProfile(req, res, next) {
    try {
      const userId = req.userId;

      const user = await authService.getUserProfile(userId);

      res.json(
        ApiResponse.success(user, 'Profile retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/auth/profile
  async updateProfile(req, res, next) {
    try {
      const userId = req.userId;
      const updateData = req.body;

      const user = await authService.updateUserProfile(userId, updateData);

      res.json(
        ApiResponse.success(user, 'Profile updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/change-password
  async changePassword(req, res, next) {
    try {
      const userId = req.userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        const ApiError = require('../utils/apiError');
        throw ApiError.badRequest('Old password and new password are required');
      }

      if (newPassword.length < 8) {
        const ApiError = require('../utils/apiError');
        throw ApiError.badRequest('New password must be at least 8 characters');
      }

      const result = await authService.changePassword(userId, oldPassword, newPassword);

      res.json(
        ApiResponse.success(result, 'Password changed successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      res.json(
        ApiResponse.success(null, 'Logout successful')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();