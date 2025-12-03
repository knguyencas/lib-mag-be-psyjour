const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  favorite_id: {
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
  
  book_id: {
    type: String,
    required: true,
    index: true
  },
  
  added_at: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true,
  collection: 'favorites'
});

favoriteSchema.index({ user_id: 1, book_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);