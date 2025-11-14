const mongoose = require('mongoose');

const PRIMARY_GENRES = [
  'Psychology',
  'Philosophy', 
  'Literature',
  'Psychiatry',
  'Thriller & Horror',
  'Social Sciences',
  'Religion & Spirituality',
  'Science',
  'Business & Economics'
];

const CATEGORIES = {
  Psychology: [
    'Psychological Fiction',
    'Psychoanalysis',
    'Analytical Psychology',
    'Clinical Psychology',
    'Cognitive Psychology',
    'Existential Psychology',
    'Social Psychology',
    'Behavioral Psychology',
    'Depth Psychology',
    'Neuropsychology',
    'Developmental Psychology'
  ],
  
  Philosophy: [
    'Existentialism',
    'Phenomenology',
    'Metaphysics',
    'Epistemology',
    'Ethics',
    'Political Philosophy',
    'Moral Philosophy',
    'Eastern Philosophy',
    'Western Philosophy',
    'Ancient Philosophy',
    'Modern Philosophy',
    'Philosophy of Mind',
    'Philosophy of Language',
    'Absurdism',
    'Stoicism',
    'Taoism',
    'Buddhism',
    'Rationalism',
    'Empiricism',
    'Idealism',
    'Skepticism'
  ],
  
  Literature: [
    'Classic Literature',
    'Modern Literature',
    'Psychological Fiction',
    'Existential Fiction',
    'Autobiographical Novel',
    'Epistolary Novel',
    'Gothic Literature',
    'Dystopian Literature',
    'Magical Realism',
    'Modernist Fiction',
    'Postmodern Fiction',
    'Romantic Literature',
    'Feminist Literature',
    'Coming-of-Age',
    'Dark Academia',
    'Symbolism',
    'Surrealism'
  ],
  
  Psychiatry: [
    'Psychopathology',
    'Mental Health',
    'Bipolar Disorder',
    'Schizophrenia',
    'Depression Studies',
    'Addiction',
    'Psychiatric Treatment'
  ],
  
  'Thriller & Horror': [
    'Psychological Thriller',
    'Psychological Horror',
    'Suspense',
    'Crime Fiction'
  ],
  
  'Social Sciences': [
    'Sociology',
    'Anthropology',
    'Cultural Studies',
    'History',
    'Gender Studies',
    'Political Science'
  ],
  
  'Religion & Spirituality': [
    'Theology',
    'Buddhist Philosophy',
    'Christian Theology',
    'Spiritual Literature',
    'Mysticism'
  ],
  
  Science: [
    'Neuroscience',
    'Cognitive Science',
    'Physics',
    'Biology',
    'Science and Spirituality'
  ],
  
  'Business & Economics': [
    'Behavioral Economics',
    'Finance',
    'Decision Science'
  ]
};

const TAGS = {
  Psychology: [
    'depression',
    'anxiety',
    'trauma',
    'obsession',
    'alienation',
    'identity-crisis',
    'mental-illness',
    'consciousness',
    'memory',
    'dream-studies',
    'instinct-theory',
    'cognitive-decline',
    'psychological-fiction',
    'psychoanalysis',
    'behavioral-science'
  ],
  
  Philosophy: [
    'existential-crisis',
    'meaning-of-life',
    'free-will',
    'consciousness',
    'being-and-nothingness',
    'absurdity',
    'nihilism',
    'ethics',
    'morality',
    'metaphysics',
    'epistemology',
    'ontology',
    'phenomenology',
    'existentialism',
    'stoicism',
    'taoism',
    'buddhism'
  ],
  
  Literature: [
    'narrative',
    'character-study',
    'stream-of-consciousness',
    'introspection',
    'confession',
    'classic-literature',
    'modern-literature',
    'feminist-literature',
    'coming-of-age',
    'symbolism',
    'surrealism',
    'magical-realism',
    'dark-academia'
  ],
  
  Psychiatry: [
    'madness',
    'insanity',
    'mental-breakdown',
    'institutionalization',
    'diagnosis',
    'bipolar-disorder',
    'schizophrenia',
    'addiction',
    'psychopathology'
  ],
  
  'Thriller & Horror': [
    'murder',
    'violence',
    'paranoia',
    'captivity',
    'obsession',
    'psychological-manipulation',
    'suspense',
    'crime',
    'horror'
  ],
  
  'Social Sciences': [
    'society',
    'culture',
    'power-structures',
    'inequality',
    'conformity',
    'social-order',
    'history',
    'anthropology',
    'gender-studies'
  ],
  
  'Religion & Spirituality': [
    'faith',
    'salvation',
    'enlightenment',
    'meditation',
    'prayer',
    'theology',
    'mysticism',
    'spiritual-practice',
    'buddhist-philosophy'
  ],
  
  Science: [
    'brain',
    'consciousness',
    'quantum-physics',
    'evolution',
    'neuroscience',
    'cognitive-science',
    'biology'
  ],
  
  'Business & Economics': [
    'money-psychology',
    'investment',
    'risk',
    'behavioral-bias',
    'finance',
    'decision-making',
    'behavioral-economics'
  ]
};

// Book Structure
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
  description: String
}, { _id: false });

// over Image
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

// Upload Info
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
    enum: PRIMARY_GENRES,
    required: true,
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
    required: true
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

bookSchema.virtual('available_categories').get(function() {
  return CATEGORIES[this.primary_genre] || [];
});

bookSchema.virtual('available_tags').get(function() {
  return TAGS[this.primary_genre] || [];
});

bookSchema.pre('save', function(next) {
  if (this.primary_genre && this.categories) {
    const validCategories = CATEGORIES[this.primary_genre] || [];
    const invalidCategories = this.categories.filter(cat => !validCategories.includes(cat));
    
    if (invalidCategories.length > 0) {
      return next(new Error(`Invalid categories for genre "${this.primary_genre}": ${invalidCategories.join(', ')}`));
    }
  }
  next();
});

bookSchema.statics.getPrimaryGenres = function() {
  return PRIMARY_GENRES;
};

bookSchema.statics.getCategoriesByGenre = function(genre) {
  return CATEGORIES[genre] || [];
};

bookSchema.statics.getTagsByGenre = function(genre) {
  return TAGS[genre] || [];
};

bookSchema.statics.getAllCategories = function() {
  return CATEGORIES;
};

bookSchema.statics.getAllTags = function() {
  return TAGS;
};

bookSchema.methods.isValidCategory = function(category) {
  const validCategories = CATEGORIES[this.primary_genre] || [];
  return validCategories.includes(category);
};

bookSchema.methods.isValidTag = function(tag) {
  const validTags = TAGS[this.primary_genre] || [];
  return validTags.includes(tag);
};

bookSchema.methods.incrementViewCount = function() {
  this.view_count += 1;
  return this.save();
};

bookSchema.methods.incrementDownloadCount = function() {
  this.download_count += 1;
  return this.save();
};

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
module.exports.PRIMARY_GENRES = PRIMARY_GENRES;
module.exports.CATEGORIES = CATEGORIES;
module.exports.TAGS = TAGS;