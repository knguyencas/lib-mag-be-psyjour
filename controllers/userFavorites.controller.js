const userFavoritesService = require('../services/userFavorites.service');
const ApiResponse = require('../utils/apiResponse.js');

class UserFavoritesController {
  // POST /api/favorites/:bookId
  async toggleFavorite(req, res, next) {
    try {
      const { bookId } = req.params;
      const userId = req.user._id;

      const result = await userFavoritesService.toggleFavorite(userId, bookId);

      const message =
        result.action === 'added'
          ? 'Added to favorites'
          : 'Removed from favorites';

      res.json(
        ApiResponse.success(result, message)
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/favorites
  async getUserFavorites(req, res, next) {
    try {
      const userId = req.user._id;
      const result = await userFavoritesService.getUserFavorites(userId, req.query);

      res.json(
        ApiResponse.paginated(
          result.favorites,
          result.pagination,
          'Favorites retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/favorites/:bookId/check
  async checkFavorite(req, res, next) {
    try {
      const { bookId } = req.params;
      const userId = req.user._id;

      const isFavorited = await userFavoritesService.isFavorited(userId, bookId);

      res.json(
        ApiResponse.success(
          { isFavorited },
          'Favorite status retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserFavoritesController();
