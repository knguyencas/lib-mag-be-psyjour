const mongoose = require('mongoose');

const visualPostSchema = new mongoose.Schema({
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
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  image: {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    width: Number,
    height: Number,
    format: String
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
  
  likes: {
    type: Number,
    default: 0
  },
  
  liked_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  view_count: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  
  is_featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'visual_posts'
});

visualPostSchema.index({ title: 'text', description: 'text' });
visualPostSchema.index({ createdAt: -1 });
visualPostSchema.index({ likes: -1 });

visualPostSchema.methods.toggleLike = async function(userId) {
  const userIdStr = userId.toString();
  const likeIndex = this.liked_by.findIndex(id => id.toString() === userIdStr);
  
  if (likeIndex > -1) {
    this.liked_by.splice(likeIndex, 1);
    this.likes = Math.max(0, this.likes - 1);
  } else {
    this.liked_by.push(userId);
    this.likes += 1;
  }
  
  await this.save();
  return this;
};

visualPostSchema.methods.incrementView = async function() {
  this.view_count += 1;
  await this.constructor.updateOne(
    { _id: this._id },
    { $inc: { view_count: 1 } }
  );
};

module.exports = mongoose.model('VisualPost', visualPostSchema);