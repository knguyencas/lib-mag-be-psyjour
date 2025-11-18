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

// Get all categories grouped by primary genre
categorySchema.statics.getAllCategoriesGrouped = async function() {
  const categories = await this.find({ isActive: true });
  
  const grouped = {};
  categories.forEach(cat => {
    if (cat.primary_genre) {
      if (!grouped[cat.primary_genre]) {
        grouped[cat.primary_genre] = [];
      }
      if (!grouped[cat.primary_genre].includes(cat.name)) {
        grouped[cat.primary_genre].push(cat.name);
      }
    }
  });
  
  return grouped;
};

// Get primary genre by category name
categorySchema.statics.getPrimaryGenreByCategory = async function(categoryName) {
  const category = await this.findOne({ name: categoryName, isActive: true });
  return category ? category.primary_genre : null;
};

// Validate categories belong to same primary genre
categorySchema.statics.validateCategoriesSameGenre = async function(categoryNames) {
  if (!categoryNames || categoryNames.length === 0) {
    return { valid: false, error: 'No categories provided' };
  }

  const categories = await this.find({ 
    name: { $in: categoryNames },
    isActive: true
  });

  if (categories.length !== categoryNames.length) {
    const found = categories.map(c => c.name);
    const missing = categoryNames.filter(c => !found.includes(c));
    return { 
      valid: false, 
      error: `Invalid categories: ${missing.join(', ')}` 
    };
  }

  // Get unique primary genres
  const primaryGenres = [...new Set(categories.map(c => c.primary_genre).filter(Boolean))];
  
  if (primaryGenres.length > 1) {
    return { 
      valid: false, 
      error: `Categories belong to different primary genres: ${primaryGenres.join(', ')}`,
      primaryGenres 
    };
  }

  if (primaryGenres.length === 0) {
    return {
      valid: false,
      error: 'Categories do not have primary_genre set'
    };
  }

  return { 
    valid: true, 
    primary_genre: primaryGenres[0] 
  };
};

categorySchema.statics.isValidCategory = async function(categoryName) {
  const count = await this.countDocuments({ name: categoryName, isActive: true });
  return count > 0;
};

module.exports = mongoose.model('Category', categorySchema);