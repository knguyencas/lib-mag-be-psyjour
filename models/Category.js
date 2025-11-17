const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    unique: true,
    sparse: true,
  },

  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  primary_genre: {
    type: String,
    trim: true
  },

  primary_genre_id: {
    type: String,
    trim: true
  },

  genres: [{
    type: String,
    trim: true
  }],

  genre_ids: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Virtual for books in this category 
categorySchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'category'
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

categorySchema.statics.getCategoryNamesForPrimaryGenre = async function(primaryGenre) {
  if (!primaryGenre) return [];

  const docs = await this.find({
    $or: [
      { primary_genre: primaryGenre },
      { genres: primaryGenre }
    ]
  }).select('name');

  return docs.map(d => d.name);
};

categorySchema.statics.getAllPrimaryGenres = async function() {
  const docs = await this.find({}).select('primary_genre genres');

  const set = new Set();

  docs.forEach(doc => {
    if (doc.primary_genre) set.add(doc.primary_genre);
    (doc.genres || []).forEach(g => {
      if (g) set.add(g);
    });
  });

  return Array.from(set).sort();
};

module.exports = mongoose.model('Category', categorySchema);