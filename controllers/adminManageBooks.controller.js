const Book = require('../models/Book');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc    Get all books with advanced filtering and sorting
 * @route   GET /api/admin/books/manage
 * @access  Admin, Super Admin
 */
const getAllBooks = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { book_id: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(filter);

    res.json(ApiResponse.paginated(books, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }, 'Books retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a book
 * @route   PUT /api/admin/books/manage/:id
 * @access  Admin, Super Admin
 */
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findOneAndUpdate(
      { book_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    res.json(ApiResponse.success(book, 'Book updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a book
 * @route   DELETE /api/admin/books/manage/:id
 * @access  Admin, Super Admin
 */
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOneAndDelete({ book_id: req.params.id });

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    res.json(ApiResponse.success(null, 'Book deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  updateBook,
  deleteBook
};