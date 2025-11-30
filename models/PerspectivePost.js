const mongoose = require('mongoose');

const perspectivePostSchema = new mongoose.Schema({
  post_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  author_username: {
    type: String,
    required: true
  },
  
  topic: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  primary_genre: {
    type: String,
    index: true
  },
  
  upvotes: {
    type: Number,
    default: 0
  },
  
  downvotes: {
    type: Number,
    default: 0
  },
  
  upvoted_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  downvoted_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  comment_count: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  
  is_pinned: {
    type: Boolean,
    default: false
  },
  
  last_activity: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'perspective_posts'
});

perspectivePostSchema.index({ topic: 'text', content: 'text' });
perspectivePostSchema.index({ createdAt: -1 });
perspectivePostSchema.index({ upvotes: -1 });
perspectivePostSchema.index({ last_activity: -1 });

perspectivePostSchema.methods.upvote = async function(userId) {
  const userIdStr = userId.toString();
  
  const downvoteIndex = this.downvoted_by.findIndex(id => id.toString() === userIdStr);
  if (downvoteIndex > -1) {
    this.downvoted_by.splice(downvoteIndex, 1);
    this.downvotes = Math.max(0, this.downvotes - 1);
  }
  
  const upvoteIndex = this.upvoted_by.findIndex(id => id.toString() === userIdStr);
  if (upvoteIndex > -1) {
    this.upvoted_by.splice(upvoteIndex, 1);
    this.upvotes = Math.max(0, this.upvotes - 1);
  } else {
    this.upvoted_by.push(userId);
    this.upvotes += 1;
  }
  
  await this.save();
  return this;
};

perspectivePostSchema.methods.downvote = async function(userId) {
  const userIdStr = userId.toString();
  
  const upvoteIndex = this.upvoted_by.findIndex(id => id.toString() === userIdStr);
  if (upvoteIndex > -1) {
    this.upvoted_by.splice(upvoteIndex, 1);
    this.upvotes = Math.max(0, this.upvotes - 1);
  }
  
  const downvoteIndex = this.downvoted_by.findIndex(id => id.toString() === userIdStr);
  if (downvoteIndex > -1) {
    this.downvoted_by.splice(downvoteIndex, 1);
    this.downvotes = Math.max(0, this.downvotes - 1);
  } else {
    this.downvoted_by.push(userId);
    this.downvotes += 1;
  }
  
  await this.save();
  return this;
};

module.exports = mongoose.model('PerspectivePost', perspectivePostSchema);