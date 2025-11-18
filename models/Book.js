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
      
      const validation = await Category.validateCategoriesSameGenre(this.categories);
      
      if (!validation.valid) {
        return next(new Error(validation.error));
      }
      
      if (!this.primary_genre) {
        this.primary_genre = validation.primary_genre;
        console.log(`✅ Auto-set primary_genre to "${this.primary_genre}" for book: ${this.book_id}`);
      }
      
      if (this.primary_genre !== validation.primary_genre) {
        return next(new Error(
          `Book primary_genre is "${this.primary_genre}" but categories belong to "${validation.primary_genre}"`
        ));
      }
    }
    
    if (this.primary_genre) {
      const isValidGenre = await PrimaryGenre.isValidGenre(this.primary_genre);
      if (!isValidGenre) {
        console.warn(`⚠️  primary_genre "${this.primary_genre}" not found in primary_genres collection for book ${this.book_id}`);
      }
    }
    
    if (this.tags && this.tags.length > 0) {
      for (const tag of this.tags) {
        const isValid = await Tag.isValidTag(tag);
        if (!isValid) {
          console.warn(`⚠️  Tag "${tag}" not found in tags collection for book ${this.book_id}`);
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
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

bookSchema.methods.incrementViewCount = function() {
  this.view_count += 1;
  return this.save();
};

bookSchema.methods.incrementDownloadCount = function() {
  this.download_count += 1;
  return this.save();
};

module.exports = mongoose.model('Book', bookSchema);