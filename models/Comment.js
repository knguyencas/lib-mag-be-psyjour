const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comment_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  target_type: {
    type: String,
    enum: ['perspective_post', 'visual_post'],
    required: true,
    index: true
  },
  
  target_id: {
    type: String,
    required: true,
    index: true
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
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'approved',
    index: true
  },
  
  upvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  downvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  score: {
    type: Number,
    default: 0
  },
  
  reply_count: {
    type: Number,
    default: 0,
    min: 0
  },
  
  report_count: {
    type: Number,
    default: 0,
    min: 0
  },
  
  edited: {
    type: Boolean,
    default: false
  },
  
  edited_at: {
    type: Date
  }
  
}, {
  timestamps: true,
  collection: 'comments'
});

// Indexes
commentSchema.index({ target_type: 1, target_id: 1, status: 1 });
commentSchema.index({ parent_comment_id: 1 });
commentSchema.index({ user_id: 1, createdAt: -1 });
commentSchema.index({ score: -1 });
commentSchema.index({ createdAt: -1 });

// Update parent comment reply count
commentSchema.post('save', async function() {
  if (this.parent_comment_id && this.status === 'approved') {
    await updateReplyCount(this.parent_comment_id);
  }
  
  // Update post comment count
  await updatePostCommentCount(this.target_type, this.target_id);
});

commentSchema.post('remove', async function() {
  if (this.parent_comment_id) {
    await updateReplyCount(this.parent_comment_id);
  }
  
  await updatePostCommentCount(this.target_type, this.target_id);
});

async function updateReplyCount(parentCommentId) {
  try {
    const Comment = mongoose.model('Comment');
    
    const count = await Comment.countDocuments({
      parent_comment_id: parentCommentId,
      status: 'approved'
    });
    
    await Comment.updateOne(
      { comment_id: parentCommentId },
      { reply_count: count }
    );
    
    console.log(`✅ Updated comment ${parentCommentId} reply count: ${count}`);
  } catch (error) {
    console.error('Error updating reply count:', error);
  }
}

async function updatePostCommentCount(targetType, targetId) {
  try {
    const Comment = mongoose.model('Comment');
    
    const count = await Comment.countDocuments({
      target_type: targetType,
      target_id: targetId,
      status: 'approved'
    });
    
    let Model;
    let idField;
    
    if (targetType === 'perspective_post') {
      Model = require('./PerspectivePost');
      idField = 'post_id';
    } else if (targetType === 'visual_post') {
      Model = require('./VisualPost');
      idField = 'post_id';
    }
    
    if (Model) {
      await Model.updateOne(
        { [idField]: targetId },
        { comment_count: count }
      );
      
      console.log(`✅ Updated ${targetType} ${targetId} comment count: ${count}`);
    }
  } catch (error) {
    console.error('Error updating post comment count:', error);
  }
}

module.exports = mongoose.model('Comment', commentSchema);