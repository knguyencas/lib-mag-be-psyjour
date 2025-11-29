const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    author_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      index: true,
    },

    full_name: {
      type: String,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      index: true,
    },

    birth_year: Number,
    death_year: Number,

    nationality: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    genres: [
      {
        type: String,
        trim: true,
      },
    ],

    image: {
      type: String,
      trim: true,
    },

    books: [
      {
        book_id: String,
        title: String,
        year: Number,
        rating: Number,
      },
    ],

    book_count: {
      type: Number,
      default: 0,
    },

    average_rating: {
      type: Number,
      default: 0,
    },

    needs_update: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

authorSchema.index({ name: 'text', full_name: 'text' });

module.exports = mongoose.model('Author', authorSchema);
