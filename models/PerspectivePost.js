const mongoose = require('mongoose');

const perspectivePostSchema = new mongoose.Schema({
  post_id: {
    type: String,
    required: true,
    unique: true
  },
  topic: {
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
  upvotes: {
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

module.exports = mongoose.model('PerspectivePost', perspectivePostSchema);