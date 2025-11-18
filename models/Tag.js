const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  tag_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  category_id: {
    type: String,
    required: true,
    index: true
  },
  category_name: {
    type: String,
    required: true
  }
}, {
  timestamps: false,
  collection: 'tags'
});

tagSchema.index({ category_id: 1 });
tagSchema.index({ name: 1 });

tagSchema.statics.getTagNamesForCategory = async function(categoryName) {
  const tags = await this.find({ category_name: categoryName });
  return tags.map(t => t.name);
};

tagSchema.statics.getTagNamesForPrimaryGenre = async function(genreName) {
  const Category = require('./Category');
  
  const categories = await Category.find({ primary_genre: genreName, isActive: true });
  const categoryNames = categories.map(c => c.name);
  
  const tags = await this.find({ category_name: { $in: categoryNames } });
  
  return [...new Set(tags.map(t => t.name))];
};

tagSchema.statics.getAllTagsGrouped = async function() {
  const Category = require('./Category');
  
  const allTags = await this.find({});
  const allCategories = await Category.find({ isActive: true });
  
  const categoryToGenre = {};
  allCategories.forEach(cat => {
    categoryToGenre[cat.name] = cat.primary_genre;
  });
  
  const grouped = {};
  allTags.forEach(tag => {
    const genre = categoryToGenre[tag.category_name];
    if (genre) {
      if (!grouped[genre]) {
        grouped[genre] = [];
      }
      if (!grouped[genre].includes(tag.name)) {
        grouped[genre].push(tag.name);
      }
    }
  });
  
  return grouped;
};

tagSchema.statics.isValidTag = async function(tagName) {
  const count = await this.countDocuments({ name: tagName.toLowerCase() });
  return count > 0;
};

module.exports = mongoose.model('Tag', tagSchema);