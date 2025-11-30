const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

class AdminUserService {
  async createAdminUser(creatorId, payload) {
    const { username, email, password } = payload;

    if (!username || !password) {
      throw ApiError.badRequest('Username and password are required');
    }

    if (username.trim().length < 3) {
      throw ApiError.badRequest('Username must be at least 3 characters');
    }

    if (password.length < 8) {
      throw ApiError.badRequest('Password must be at least 8 characters');
    }

    const creator = await User.findById(creatorId);
    if (!creator || creator.role !== 'super_admin') {
      throw ApiError.forbidden('Only super_admin can create admin users');
    }

    const trimmedUsername = username.trim();
    
    let normalizedEmail = undefined;

    if (email && typeof email === 'string') {
      const trimmedEmail = email.trim();
      
      if (trimmedEmail === '') {
        normalizedEmail = undefined;
      } else {
        normalizedEmail = trimmedEmail.toLowerCase();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
          throw ApiError.badRequest('Invalid email format');
        }
        
        const existingEmail = await User.findOne({ 
          email: normalizedEmail,
          email: { $exists: true, $ne: null, $ne: '' }
        });
        if (existingEmail) {
          throw ApiError.conflict('Email already exists');
        }
      }
    }

    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      throw ApiError.conflict('Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      username: trimmedUsername,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };

    if (normalizedEmail !== undefined) {
      userData.email = normalizedEmail;
    }

    const newAdmin = new User(userData);
    await newAdmin.save();

    return {
      id: newAdmin._id,
      username: newAdmin.username,
      email: newAdmin.email || null,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt
    };
  }

  async getAllAdmins(requesterId) {
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== 'super_admin') {
      throw ApiError.forbidden('Only super_admin can view admin list');
    }

    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    return admins;
  }

  async deleteAdmin(requesterId, adminId) {
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== 'super_admin') {
      throw ApiError.forbidden('Only super_admin can delete admin users');
    }

    const adminToDelete = await User.findById(adminId);
    if (!adminToDelete) {
      throw ApiError.notFound('Admin user not found');
    }

    if (adminToDelete.role === 'super_admin') {
      throw ApiError.forbidden('Cannot delete super_admin');
    }

    if (adminToDelete.role !== 'admin') {
      throw ApiError.badRequest('Can only delete admin users');
    }

    await User.findByIdAndDelete(adminId);

    return { message: 'Admin user deleted successfully' };
  }
}

module.exports = new AdminUserService();