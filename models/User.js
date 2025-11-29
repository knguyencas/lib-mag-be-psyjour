const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    unique: true
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

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);