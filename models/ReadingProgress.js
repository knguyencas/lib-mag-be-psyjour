const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  progress_id: {
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
  
  chapter_index: {
    type: Number,
    default: 0,
    min: 0
  },
  
  scroll_position: {
    type: Number,
    default: 0,
    min: 0
  },
  
  progress_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  last_read_at: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true,
  collection: 'reading_progress'
});

readingProgressSchema.index({ user_id: 1, book_id: 1 }, { unique: true });
readingProgressSchema.index({ last_read_at: -1 });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);