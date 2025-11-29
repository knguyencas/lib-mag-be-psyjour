const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  email: {
    type: String,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  displayName: {
    type: String,
    trim: true
  },

  avatar: {
    type: String,
    trim: true
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user',
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  lastLogin: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
