const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comment_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  post_id: {
    type: String,
    required: true,
    index: true
  },
  
  post_type: {
    type: String,
    enum: ['perspective'],
    required: true
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
  
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  parent_comment_id: {
    type: String,
    default: null,
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
  
  reply_count: {
    type: Number,
    default: 0
  },
  
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'comments'
});

commentSchema.index({ post_id: 1, createdAt: -1 });
commentSchema.index({ parent_comment_id: 1, createdAt: 1 });

commentSchema.methods.upvote = async function(userId) {
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

commentSchema.methods.downvote = async function(userId) {
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

module.exports = mongoose.model('Comment', commentSchema);