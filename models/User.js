const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
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
  timestamps: true,
  strict: false
});

userSchema.index({ username: 1 });

userSchema.index(
  { email: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { 
      email: { $exists: true, $ne: null, $ne: '' } 
    }
  }
);

userSchema.pre('validate', function(next) {
  if (typeof this.email === 'string') {
    const trimmed = this.email.trim();
    if (trimmed === '') {
      this.email = undefined;
    }
  }
  next();
});

userSchema.pre('save', function(next) {
  if (!this.email || this.email === '' || (typeof this.email === 'string' && this.email.trim() === '')) {
    this.email = undefined;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);