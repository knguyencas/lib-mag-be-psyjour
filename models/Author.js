const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  author_id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  biography: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  nationality: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true
  },
  needs_update: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

authorSchema.virtual('books', {
  ref: 'Book',
  localField: 'author_id',
  foreignField: 'author_id'
});

authorSchema.set('toJSON', { virtuals: true });
authorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Author', authorSchema);
