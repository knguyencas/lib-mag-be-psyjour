const Author = require('../models/Author');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const ApiError = require('../utils/apiError');

class AdminMetaService {
  async searchAuthors(term) {
    const q = (term || '').trim();
    if (!q) {
      return [];
    }

    const regex = new RegExp(q, 'i');

    const authors = await Author.find({
      name: { $regex: regex }
    })
      .sort({ name: 1 })
      .limit(10)
      .lean();

    return authors.map(a => ({
      author_id: a.author_id || null,
      name: a.name,
      nationality: a.nationality || null,
      needs_update: !!a.needs_update
    }));
  }

  async searchCategories(term) {
    const q = (term || '').trim();
    if (!q) return [];

    const regex = new RegExp(q, 'i');

    const categories = await Category.find({
      name: { $regex: regex },
      isActive: true
    })
      .sort({ name: 1 })
      .limit(10)
      .lean();

    return categories.map(c => ({
      category_id: c.category_id || null,
      name: c.name,
      primary_genre: c.primary_genre || null,
      needs_update: !!c.needs_update
    }));
  }

  async searchTags(term) {
    const q = (term || '').trim();
    if (!q) return [];

    const regex = new RegExp(q, 'i');

    const tags = await Tag.find({
      name: { $regex: regex },
      isActive: true
    })
      .sort({ name: 1 })
      .limit(10)
      .lean();

    return tags.map(t => ({
      tag_id: t.tag_id || null,
      name: t.name,
      primary_genre: t.primary_genre || null,
      needs_update: !!t.needs_update
    }));
  }
}

module.exports = new AdminMetaService();
