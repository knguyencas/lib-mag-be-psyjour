const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  vote_id: {
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
    enum: ['perspective_post', 'visual_post', 'comment'],
    required: true,
    index: true
  },
  
  target_id: {
    type: String,
    required: true,
    index: true
  },
  
  vote_type: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  }
  
}, {
  timestamps: true,
  collection: 'votes'
});

voteSchema.index({ user_id: 1, target_type: 1, target_id: 1 }, { unique: true });
voteSchema.index({ target_type: 1, target_id: 1 });
voteSchema.index({ createdAt: -1 });

voteSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await this.constructor.findOne({
      user_id: this.user_id,
      target_type: this.target_type,
      target_id: this.target_id,
      _id: { $ne: this._id }
    });
    
    if (existing) {
      throw new Error('User has already voted on this item');
    }
  }
  next();
});

voteSchema.post('save', async function() {
  await updateVoteCounts(this.target_type, this.target_id);
});

voteSchema.post('remove', async function() {
  await updateVoteCounts(this.target_type, this.target_id);
});

async function updateVoteCounts(targetType, targetId) {
  try {
    const Vote = mongoose.model('Vote');
    
    const stats = await Vote.aggregate([
      { 
        $match: { 
          target_type: targetType,
          target_id: targetId
        }
      },
      {
        $group: {
          _id: '$vote_type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const upvotes = stats.find(s => s._id === 'upvote')?.count || 0;
    const downvotes = stats.find(s => s._id === 'downvote')?.count || 0;
    
    let Model;
    let idField;
    
    if (targetType === 'perspective_post') {
      Model = require('./PerspectivePost');
      idField = 'post_id';
    } else if (targetType === 'visual_post') {
      Model = require('./VisualPost');
      idField = 'post_id';
    } else if (targetType === 'comment') {
      Model = require('./Comment');
      idField = 'comment_id';
    }
    
    if (Model) {
      await Model.updateOne(
        { [idField]: targetId },
        { 
          upvotes,
          downvotes,
          score: upvotes - downvotes
        }
      );
      
      console.log(`Updated ${targetType} ${targetId} votes: ↑${upvotes} ↓${downvotes}`);
    }
  } catch (error) {
    console.error('Error updating vote counts:', error);
  }
}

module.exports = mongoose.model('Vote', voteSchema);