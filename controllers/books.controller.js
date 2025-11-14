const bookService = require('../services/books.service.js');
const ApiResponse = require('../utils/apiResponse.js');


class BookController {
//GET /api/books
  async getAllBooks(req, res, next) {
    try {
      const result = await bookService.getAllBooks(req.query);

      res.json(
        ApiResponse.paginated(
          result.books,
          result.pagination,
          'Books retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/:id
  async getBookById(req, res, next) {
    try {
      const book = await bookService.getBookById(req.params.id);

      res.json(
        ApiResponse.success(book, 'Book retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//POST /api/books
  async createBook(req, res, next) {
    try {
      const book = await bookService.createBook(req.body);

      res.status(201).json(
        ApiResponse.success(book, 'Book created successfully', 201)
      );
    } catch (error) {
      next(error);
    }
  }

//PUT /api/books/:id
  async updateBook(req, res, next) {
    try {
      const book = await bookService.updateBook(req.params.id, req.body);

      res.json(
        ApiResponse.success(book, 'Book updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//DELETE /api/books/:id
  async deleteBook(req, res, next) {
    try {
      await bookService.deleteBook(req.params.id);

      res.json(
        ApiResponse.success(null, 'Book deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/genre/:genre
  async getBooksByGenre(req, res, next) {
    try {
      const books = await bookService.getBooksByGenre(req.params.genre);

      res.json(
        ApiResponse.success(books, 'Books retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/category/:category
  async getBooksByCategory(req, res, next) {
    try {
      const books = await bookService.getBooksByCategory(req.params.category);

      res.json(
        ApiResponse.success(books, 'Books retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/tags/:tag
  async getBooksByTag(req, res, next) {
    try {
      const books = await bookService.getBooksByTag(req.params.tag);

      res.json(
        ApiResponse.success(books, 'Books retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/author/:authorId
  async getBooksByAuthor(req, res, next) {
    try {
      const books = await bookService.getBooksByAuthor(req.params.authorId);

      res.json(
        ApiResponse.success(books, 'Books retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/stats/overview
  async getStatsOverview(req, res, next) {
    try {
      const stats = await bookService.getStatsOverview();

      res.json(
        ApiResponse.success(stats, 'Statistics retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/top-rated-by-category
  async getTopRatedByCategory(req, res, next) {
    try {
      const result = await bookService.getTopRatedByCategory();

      res.json(
        ApiResponse.success(result, 'Top rated books retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//PATCH /api/books/:id/status
  async updateStatus(req, res, next) {
    try {
      const book = await bookService.updateStatus(req.params.id, req.body.status);

      res.json(
        ApiResponse.success(book, 'Status updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//PATCH /api/books/:id/rating
  async updateRating(req, res, next) {
    try {
      const book = await bookService.updateRating(req.params.id, req.body.rating);

      res.json(
        ApiResponse.success(book, 'Rating updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//PATCH /api/books/:id/featured
  async toggleFeatured(req, res, next) {
    try {
      const book = await bookService.toggleFeatured(req.params.id, req.body.featured);

      res.json(
        ApiResponse.success(book, 'Featured status updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//POST /api/books/:id/download
  async incrementDownload(req, res, next) {
    try {
      const result = await bookService.incrementDownload(req.params.id);

      res.json(
        ApiResponse.success(result, 'Download count incremented')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/metadata/genres
  getPrimaryGenres(req, res, next) {
    try {
      const genres = bookService.getPrimaryGenres();

      res.json(
        ApiResponse.success(genres, 'Genres retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/metadata/categories
  getAllCategories(req, res, next) {
    try {
      const categories = bookService.getAllCategories();

      res.json(
        ApiResponse.success(categories, 'Categories retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/metadata/categories/:genre
  getCategoriesByGenre(req, res, next) {
    try {
      const categories = bookService.getCategoriesByGenre(req.params.genre);

      res.json(
        ApiResponse.success(categories, 'Categories retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/metadata/tags
  getAllTags(req, res, next) {
    try {
      const tags = bookService.getAllTags();

      res.json(
        ApiResponse.success(tags, 'Tags retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/metadata/tags/:genre
  getTagsByGenre(req, res, next) {
    try {
      const tags = bookService.getTagsByGenre(req.params.genre);

      res.json(
        ApiResponse.success(tags, 'Tags retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/search
  async searchBooks(req, res, next) {
    try {
      const result = await bookService.searchBooks(req.query);

      res.json(
        ApiResponse.paginated(
          result.books,
          result.pagination,
          'Search results retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/featured
  async getFeaturedBooks(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const books = await bookService.getFeaturedBooks(limit);

      res.json(
        ApiResponse.success(books, 'Featured books retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

//GET /api/books/:id/related
  async getRelatedBooks(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const books = await bookService.getRelatedBooks(req.params.id, limit);

      res.json(
        ApiResponse.success(books, 'Related books retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();