const adminBooksService = require('../services/adminBooks.service');
const ApiResponse = require('../utils/apiResponse');

class AdminBooksController {
  async createBook(req, res, next) {
    try {
      const adminUserId = req.userId; // từ auth middleware
      const book = await adminBooksService.createBook(adminUserId, req.body, req.files);

      res.status(201).json(
        ApiResponse.success(book, 'Book created successfully', 201)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminBooksController();
