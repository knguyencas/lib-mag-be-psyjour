const mongoose = require('mongoose');

const perspectivePostSchema = new mongoose.Schema({
  post_id: {
    type: String,
    required: true,
    unique: true
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
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
  tags: [{
    type: String,
    trim: true
  }],
  primary_genre: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'rejected', 'archived'],
    default: 'pending'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

perspectivePostSchema.index({ status: 1, createdAt: -1 });
perspectivePostSchema.index({ author_id: 1 });
perspectivePostSchema.index({ post_id: 1 });

const PerspectivePost = mongoose.model('PerspectivePost', perspectivePostSchema);

module.exports = PerspectivePost;