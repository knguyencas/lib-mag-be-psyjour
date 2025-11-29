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
    sparse: true
  }
);

userSchema.pre('save', function(next) {
  if (!this.email || this.email === '' || this.email === null) {
    delete this.email;
    delete this._doc.email;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);