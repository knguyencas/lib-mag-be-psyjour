const mongoose = require('mongoose');
const Category = require('./Category');
const Tag = require('./Tag');
const PrimaryGenre = require('./Primarygenre');

const coverImageCloudSchema = new mongoose.Schema({
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
}, { _id: false });

// EPUB Schema
const epubSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    required: true
  },
  size_bytes: Number,
  mime_type: {
    type: String,
    default: 'application/epub+zip'
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Upload Info Schema
const uploadInfoSchema = new mongoose.Schema({
  admin_id: {
    type: String,
    required: true
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  },
  published_at: Date
}, { _id: false });

// Book Structure - EPUB Split
const structureSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['chapters_only', 'parts_and_chapters', 'sections', 'books'],
    required: true
  },
  has_parts: {
    type: Boolean,
    default: false
  },
  has_chapters: {
    type: Boolean,
    default: false
  },
  total_parts: Number,
  total_chapters: Number,
  total_books: Number,
  description: String,
  
  parts: [{
    part_number: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    start_href: String,
    chapters: [{
      chapter_number: {
        type: Number,
        required: true
      },
      local_chapter_number: Number,
      title: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      },
      order: Number
    }]
  }],
  
  metadata: {
    title: String,
    creator: String,
    language: String,
    publisher: String
  }
}, { _id: false });

const bookSchema = new mongoose.Schema({
  book_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  author: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  author_id: {
    type: String,
    required: true,
    index: true
  },
  
  year: {
    type: Number,
    required: true
  },
  
  publisher: {
    type: String,
    required: true
  },
  
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'vi', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
  },
  
  primary_genre: {
    type: String,
    required: false,
    index: true
  },
  
  categories: [{
    type: String,
    required: true
  }],
  
  punchline: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  blurb: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  coverImage_cloud: {
    type: coverImageCloudSchema,
    required: true
  },
  
  epub: {
    type: epubSchema,
    required: true
  },
  
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  
  pageCount: {
    type: Number,
    required: true,
    min: 1
  },
  
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  rating_count: {
    type: Number,
    default: 0,
    min: 0
  },

  comment_count: {
    type: Number,
    default: 0,
    min: 0
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  
  structure: {
    type: structureSchema,
    required: false
  },
  
  upload_info: {
    type: uploadInfoSchema,
    required: true
  },
  
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  view_count: {
    type: Number,
    default: 0,
    min: 0
  },
  
  download_count: {
    type: Number,
    default: 0,
    min: 0
  }
  
}, {
  timestamps: true,
  collection: 'books'
});

bookSchema.index({ title: 'text', author: 'text', blurb: 'text' });
bookSchema.index({ primary_genre: 1, status: 1 });
bookSchema.index({ categories: 1 });
bookSchema.index({ tags: 1 });
bookSchema.index({ featured: 1, status: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ view_count: -1 });
bookSchema.index({ createdAt: -1 });

bookSchema.pre('save', async function(next) {
  try {
    if (this.categories && this.categories.length > 0) {
      const categoryDocs = await Category.find({ 
        name: { $in: this.categories },
        isActive: true
      });

      const genreCount = {};
      categoryDocs.forEach(cat => {
        if (cat.primary_genre) {
          genreCount[cat.primary_genre] = (genreCount[cat.primary_genre] || 0) + 1;
        }
      });

      if (Object.keys(genreCount).length > 0) {
        const dominantGenre = Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])[0][0];

        if (!this.primary_genre || this.primary_genre !== dominantGenre) {
          this.primary_genre = dominantGenre;
          console.log(`✅ Set primary_genre to "${this.primary_genre}" for book: ${this.book_id}`);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    next();
  }
});

bookSchema.statics.getPrimaryGenres = async function() {
  return await Category.getAllPrimaryGenres();
};

bookSchema.statics.getCategoriesByGenre = async function(genre) {
  return await Category.getCategoryNamesForPrimaryGenre(genre);
};

bookSchema.statics.getAllCategories = async function() {
  return await Category.getAllCategoriesGrouped();
};

bookSchema.statics.getTagsByGenre = async function(genre) {
  return await Tag.getTagNamesForPrimaryGenre(genre);
};

bookSchema.statics.getAllTags = async function() {
  return await Tag.getAllTagsGrouped();
};

bookSchema.methods.isValidCategory = async function(category) {
  if (!this.primary_genre) return false;
  const validCategories = await Category.getCategoryNamesForPrimaryGenre(this.primary_genre);
  return validCategories.includes(category);
};

bookSchema.methods.isValidTag = async function(tag) {
  return await Tag.isValidTag(tag);
};

bookSchema.methods.incrementViewCount = async function() {
  this.view_count += 1;
  await this.constructor.updateOne(
    { _id: this._id },
    { $inc: { view_count: 1 } }
  );
};

bookSchema.methods.incrementDownloadCount = async function() {
  this.download_count += 1;
  await this.constructor.updateOne(
    { _id: this._id },
    { $inc: { download_count: 1 } }
  );
};

module.exports = mongoose.model('Book', bookSchema);