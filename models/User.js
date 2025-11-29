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
    required: false,        // không bắt buộc
    unique: true,
    sparse: true,           // chỉ enforce unique nếu có field email
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8            // >= 8 ký tự
  },
  displayName: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
