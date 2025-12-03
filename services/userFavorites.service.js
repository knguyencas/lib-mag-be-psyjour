const Favorite = require('../models/Favorite');
const Book = require('../models/Book');
const ApiError = require('../utils/apiError');

class UserFavoritesService {
  async generateFavoriteId() {
    const prefix = 'FAV';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  async toggleFavorite(userId, bookId) {
    const existing = await Favorite.findOne({
      user_id: userId,
      book_id: bookId
    });

    if (existing) {
      await Favorite.deleteOne({ favorite_id: existing.favorite_id });
      console.log(`Removed book ${bookId} from favorites`);
      return { action: 'removed' };
    } else {
      const favorite_id = await this.generateFavoriteId();
      
      await Favorite.create({
        favorite_id,
        user_id: userId,
        book_id: bookId
      });
      
      console.log(`Added book ${bookId} to favorites`);
      return { action: 'added' };
    }
  }

  async getUserFavorites(userId, { page = 1, limit = 12 }) {
    const favorites = await Favorite.find({ user_id: userId })
      .sort({ added_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const bookIds = favorites.map(f => f.book_id);
    
    const books = await Book.find({ book_id: { $in: bookIds } })
      .populate('author_id', 'name')
      .populate('categories', 'name');

    const favoritesWithBooks = favorites.map(fav => {
      const book = books.find(b => b.book_id === fav.book_id);
      return {
        favorite_id: fav.favorite_id,
        added_at: fav.added_at,
        book: book || null
      };
    }).filter(f => f.book !== null);

    const count = await Favorite.countDocuments({ user_id: userId });

    return {
      favorites: favoritesWithBooks,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    };
  }

  async isFavorited(userId, bookId) {
    const favorite = await Favorite.findOne({
      user_id: userId,
      book_id: bookId
    });
    
    return !!favorite;
  }
}

module.exports = new UserFavoritesService();