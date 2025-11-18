const mongoose = require('mongoose');

const primaryGenreSchema = new mongoose.Schema({
  genre_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: false,
  collection: 'primarygenres'
});

primaryGenreSchema.statics.getAllGenreNames = async function() {
  const genres = await this.find({});
  return genres.map(g => g.name);
};

primaryGenreSchema.statics.isValidGenre = async function(genreName) {
  const count = await this.countDocuments({ name: genreName });
  return count > 0;
};

primaryGenreSchema.statics.getGenreByName = async function(genreName) {
  return await this.findOne({ name: genreName });
};

module.exports = mongoose.model('PrimaryGenre', primaryGenreSchema);