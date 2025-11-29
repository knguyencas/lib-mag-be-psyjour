const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

class AdminUserService {
  async createAdminUser(creatorId, payload) {
    const { username, email, password } = payload;

    if (!username || !password) {
      throw ApiError.badRequest('Username and password are required');
    }

    const trimmedUsername = username.trim();
    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    const orCond = [{ username: trimmedUsername }];
    if (normalizedEmail) orCond.push({ email: normalizedEmail });

    const existing = await User.findOne({ $or: orCond });

    if (existing) {
      throw ApiError.conflict('Username or email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      username: trimmedUsername,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };

    if (normalizedEmail) {
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
}

module.exports = new AdminUserService();
