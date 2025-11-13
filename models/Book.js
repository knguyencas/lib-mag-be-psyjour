const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required']
  },
  isbn: {
    type: String,
    unique: true,
    trim: true,
    match: [/^(?:\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits']
  },
  publishedDate: {
    type: Date
  },
  publisher: {
    type: String,
    trim: true
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  genre: {
    type: String,
    enum: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Biography', 'History', 'Science', 'Self-Help', 'Other'],
    default: 'Other'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  description: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be between 0 and 5'],
    max: [5, 'Rating must be between 0 and 5'],
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookSchema.index({ title: 'text', description: 'text' });
bookSchema.index({ author: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ rating: -1 });

module.exports = mongoose.model('Book', bookSchema);