const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

class AuthService {

  async registerUser(username, email, password) {
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      throw ApiError.badRequest('Username must be at least 3 characters');
    }

    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      throw ApiError.conflict('Username already exists');
    }

    let normalizedEmail = undefined;
    
    if (email !== undefined && email !== null && typeof email === 'string') {
      const trimmedEmail = email.trim();
      
      if (trimmedEmail === '') {
        console.log('Email is empty string, treating as undefined');
        normalizedEmail = undefined;
      } else {
        normalizedEmail = trimmedEmail.toLowerCase();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
          throw ApiError.badRequest('Invalid email format');
        }
        
        console.log('Checking if email exists:', normalizedEmail);
        
        const existingEmail = await User.findOne({ 
          email: normalizedEmail
        }).lean();
        
        console.log('Query result:', existingEmail ? 'Found' : 'Not found');
        
        if (existingEmail) {
          console.log('Email already exists:', {
            username: existingEmail.username,
            email: existingEmail.email
          });
          throw ApiError.conflict('Email already exists');
        }
        
        console.log('Email is available');
      }
    } else {
      console.log('No email provided (undefined/null)');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      username: trimmedUsername,
      password: hashedPassword,
      createdAt: new Date(),
      role: 'user'
    };

    if (normalizedEmail !== undefined) {
      userData.email = normalizedEmail;
    }

    console.log('Creating user with data:', {
      username: userData.username,
      email: userData.email || 'null',
      hasEmail: !!userData.email,
      role: userData.role
    });

    const newUser = new User(userData);
    
    await newUser.save();
    
    console.log('User created successfully:', {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email || 'null'
    });

    const token = this._generateToken(newUser);

    return {
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email || null,
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    };
  }

  async loginUser(identifier, password) {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes('@');

    let query;
    if (isEmail) {
      query = { 
        email: trimmed.toLowerCase()
      };
    } else {
      query = { username: trimmed };
    }

    const user = await User.findOne(query);

    if (!user) {
      throw ApiError.unauthorized('Invalid username/email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid username/email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this._generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email || null,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
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

    return user;
  }

  async updateUserProfile(userId, updateData) {
    if (updateData.email) {
      throw ApiError.badRequest('Cannot update email');
    }

    if (updateData.password) {
      throw ApiError.badRequest('Use change-password endpoint to update password');
    }

    if (updateData.role) {
      throw ApiError.forbidden('Cannot update role');
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
}

module.exports = new AuthService();