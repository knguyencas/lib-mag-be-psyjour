const adminBooksService = require('../services/adminBooks.service');
const ApiResponse = require('../utils/apiResponse');

class AdminBooksController {
  async createBook(req, res, next) {
    try {
      const adminUserId = req.userId;
      
      const files = {};
      
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          if (file.fieldname === 'cover') {
            files.cover = [file];
          } else if (file.fieldname === 'ebook') {
            files.ebook = [file];
          }
        });
      }
      
      console.log('[Controller] Request body:', {
        title: req.body.title,
        author: req.body.author,
        author_id: req.body.author_id,
        author_ids: req.body.author_ids,
        new_authors: req.body.new_authors,
        categories: req.body.categories,
        tags: req.body.tags,
        files: {
          cover: files.cover ? files.cover[0].originalname : 'none',
          ebook: files.ebook ? files.ebook[0].originalname : 'none'
        }
      });
      
      const book = await adminBooksService.createBook(adminUserId, req.body, files);

      res.status(201).json(
        ApiResponse.success(book, 'Book created successfully', 201)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminBooksController();