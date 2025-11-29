const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

class AuthService {

  async registerUser(username, email, password) {
    const trimmedUsername = username.trim();
    const hasEmail = !!email && email.trim() !== '';

    const orConditions = [{ username: trimmedUsername }];
    if (hasEmail) {
      orConditions.push({ email: email.toLowerCase().trim() });
    }

    const existingUser = await User.findOne({ $or: orConditions });

    if (existingUser) {
      if (existingUser.username === trimmedUsername) {
        throw ApiError.conflict('Username already exists');
      }
      if (hasEmail && existingUser.email === email.toLowerCase().trim()) {
        throw ApiError.conflict('Email already exists');
      }
      throw ApiError.conflict('Email or username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      username: trimmedUsername,
      password: hashedPassword,
      createdAt: new Date(),
      role: 'user'
    };

    if (hasEmail) {
      userData.email = email.toLowerCase().trim();
    }

    const newUser = new User(userData);
    await newUser.save();

    const token = this._generateToken(newUser);

    return {
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email || null,
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
        role: newUser.role
      }
    };
  }

  async loginUser(identifier, password) {
    const trimmed = identifier.trim();

    const isEmail = trimmed.includes('@');

    const query = isEmail
      ? { email: trimmed.toLowerCase() }
      : { username: trimmed };

    const user = await User.findOne(query);

    if (!user) {
      throw ApiError.unauthorized('Invalid email/username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email/username or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this._generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email || null,
        displayName: user.displayName,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    };
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const stats = await this._getUserStats(userId);

    return {
      ...user,
      stats
    };
  }

  async updateUserProfile(userId, updateData) {
    if (updateData.email) {
      throw ApiError.badRequest('Cannot update email');
    }

    if (updateData.password) {
      throw ApiError.badRequest('Use change-password endpoint to update password');
    }

    if (updateData.username) {
      const existingUser = await User.findOne({
        username: updateData.username.trim(),
        _id: { $ne: userId }
      });

      if (existingUser) {
        throw ApiError.conflict('Username already taken');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      throw ApiError.notFound('User not found');
    }

    return updatedUser;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw ApiError.unauthorized('Old password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw ApiError.badRequest('New password must be different from old password');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return { message: 'Password changed successfully' };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return {
        userId: decoded.userId,
        role: decoded.role
      };
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  }


  _generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  }

  async _getUserStats(userId) {
    const Favorite = require('../models/Favorite');
    const Comment = require('../models/Comment');

    try {
      const favoriteCount = await Favorite.countDocuments({ userId });
      const commentCount = await Comment.countDocuments({ userId });

      return {
        favorites: favoriteCount,
        comments: commentCount
      };
    } catch (error) {
      return {
        favorites: 0,
        comments: 0
      };
    }
  }
}

module.exports = new AuthService();
