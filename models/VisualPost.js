const mongoose = require('mongoose');

const visualPostSchema = new mongoose.Schema({
  post_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author_username: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  image_public_id: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  likes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'archived', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VisualPost', visualPostSchema);