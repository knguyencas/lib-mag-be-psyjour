const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rating_id: {
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
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  review: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
    index: true
  },
  
  helpful_count: {
    type: Number,
    default: 0,
    min: 0
  },
  
  report_count: {
    type: Number,
    default: 0,
    min: 0
  }
  
}, {
  timestamps: true,
  collection: 'ratings'
});

ratingSchema.index({ user_id: 1, book_id: 1 }, { unique: true });
ratingSchema.index({ book_id: 1, status: 1 });
ratingSchema.index({ createdAt: -1 });

ratingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await this.constructor.findOne({
      user_id: this.user_id,
      book_id: this.book_id,
      _id: { $ne: this._id }
    });
    
    if (existing) {
      throw new Error('User has already rated this book');
    }
  }
  next();
});

ratingSchema.post('save', async function() {
  console.log('Rating saved, updating book average...');
  await updateBookAverageRating(this.book_id);
});

ratingSchema.post('remove', async function() {
  console.log('Rating removed, updating book average...');
  await updateBookAverageRating(this.book_id);
});

ratingSchema.post('deleteOne', { document: true, query: false }, async function() {
  console.log('Rating deleted (deleteOne), updating book average...');
  await updateBookAverageRating(this.book_id);
});

ratingSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    this._deletedBookId = doc.book_id;
  }
  next();
});

ratingSchema.post('findOneAndDelete', async function(doc) {
  if (this._deletedBookId) {
    console.log('Rating deleted (findOneAndDelete), updating book average...');
    await updateBookAverageRating(this._deletedBookId);
  }
});

async function updateBookAverageRating(bookId) {
  try {
    const Book = require('./Book');
    const Rating = mongoose.model('Rating');
    
    const stats = await Rating.aggregate([
      { 
        $match: { 
          book_id: bookId,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const avgRating = stats[0]?.avgRating || 0;
    const count = stats[0]?.count || 0;
    
    await Book.updateOne(
      { book_id: bookId },
      { 
        rating: avgRating,
        rating_count: count
      }
    );
    
    console.log(`Updated book ${bookId} rating: ${avgRating.toFixed(2)} (${count} ratings)`);
  } catch (error) {
    console.error('Error updating book rating:', error);
  }
}

module.exports = mongoose.model('Rating', ratingSchema);