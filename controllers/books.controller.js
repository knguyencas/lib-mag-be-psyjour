const Book = require('../models/Book.js');
const Author = require('../models/Author.js');
const Category = require('../models/Category.js');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, inStock, search, category, minRating, maxRating } = req.query;
    
    const query = {};
    
    // Filter by genre
    if (genre) query.genre = genre;
    
    // Filter by category
    if (category) query.category = category;
    
    // Filter by stock status
    if (inStock !== undefined) query.inStock = inStock === 'true';
    
    // Filter by rating range
    if (minRating) query.rating = { ...query.rating, $gte: parseFloat(minRating) };
    if (maxRating) query.rating = { ...query.rating, $lte: parseFloat(maxRating) };
    
    // Search in title and description
    if (search) {
      query.$text = { $search: search };
    }
    
    const books = await Book.find(query)
      .populate('author', 'name nationality')
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Book.countDocuments(query);
    
    res.json({
      success: true,
      data: books,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author')
      .populate('category');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private (add authentication middleware as needed)
exports.createBook = async (req, res) => {
  try {
    // Verify author exists
    const authorExists = await Author.findById(req.body.author);
    if (!authorExists) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    // Verify category exists if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }
    
    const book = await Book.create(req.body);
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to create book',
      error: error.message
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = async (req, res) => {
  try {
    // If updating author, verify the author exists
    if (req.body.author) {
      const authorExists = await Author.findById(req.body.author);
      if (!authorExists) {
        return res.status(404).json({
          success: false,
          message: 'Author not found'
        });
      }
    }
    
    // If updating category, verify the category exists
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('author', 'name nationality').populate('category', 'name slug');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Book deleted successfully',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get books by author
// @route   GET /api/books/author/:authorId
// @access  Public
exports.getBooksByAuthor = async (req, res) => {
  try {
    const books = await Book.find({ author: req.params.authorId })
      .populate('author', 'name nationality')
      .populate('category', 'name slug');
    
    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get books by category
// @route   GET /api/books/category/:categoryId
// @access  Public
exports.getBooksByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };
    
    const books = await Book.find({ category: req.params.categoryId })
      .populate('author', 'name nationality')
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);
    
    const count = await Book.countDocuments({ category: req.params.categoryId });
    
    res.json({
      success: true,
      data: books,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get top 10 books by rating for every category
// @route   GET /api/books/top-rated-by-category
// @access  Public
exports.getTopRatedBooksByCategory = async (req, res) => {
  try {
    const topBooksByCategory = await Book.aggregate([
      // Only include books with ratings
      { $match: { rating: { $gt: 0 } } },
      
      // Sort by rating in descending order
      { $sort: { rating: -1, title: 1 } },
      
      // Group by category and get top 10 books for each
      {
        $group: {
          _id: '$category',
          books: {
            $push: {
              _id: '$_id',
              title: '$title',
              author: '$author',
              rating: '$rating',
              genre: '$genre',
              price: '$price',
              inStock: '$inStock',
              publishedDate: '$publishedDate'
            }
          }
        }
      },
      
      // Limit to top 10 books per category
      {
        $project: {
          _id: 1,
          books: { $slice: ['$books', 10] }
        }
      },
      
      // Lookup category details
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      
      // Unwind category info
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      
      // Format the output
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: '$categoryInfo.name',
          categorySlug: '$categoryInfo.slug',
          books: 1
        }
      },
      
      // Sort by category name
      { $sort: { categoryName: 1 } }
    ]);
    
    // Populate author details for each book
    for (let category of topBooksByCategory) {
      await Book.populate(category.books, {
        path: 'author',
        select: 'name nationality'
      });
    }
    
    // Handle books with no category
    const booksWithoutCategory = topBooksByCategory.find(cat => cat.categoryId === null);
    if (booksWithoutCategory) {
      booksWithoutCategory.categoryName = 'Uncategorized';
      booksWithoutCategory.categorySlug = 'uncategorized';
    }
    
    res.json({
      success: true,
      data: topBooksByCategory,
      count: topBooksByCategory.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update book stock status
// @route   PATCH /api/books/:id/stock
// @access  Private
exports.updateBookStock = async (req, res) => {
  try {
    const { inStock } = req.body;
    
    if (inStock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'inStock field is required'
      });
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { inStock },
      { new: true, runValidators: true }
    ).populate('author', 'name nationality').populate('category', 'name slug');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book,
      message: `Book stock status updated to ${inStock ? 'in stock' : 'out of stock'}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update book stock',
      error: error.message
    });
  }
};

// @desc    Update book rating
// @route   PATCH /api/books/:id/rating
// @access  Public
exports.updateBookRating = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5'
      });
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true, runValidators: true }
    ).populate('author', 'name nationality').populate('category', 'name slug');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book,
      message: 'Book rating updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update book rating',
      error: error.message
    });
  }
};

// @desc    Get book statistics
// @route   GET /api/books/stats/overview
// @access  Public
exports.getBookStatistics = async (req, res) => {
  try {
    const stats = await Book.aggregate([
      {
        $facet: {
          totalBooks: [{ $count: 'count' }],
          inStockBooks: [
            { $match: { inStock: true } },
            { $count: 'count' }
          ],
          outOfStockBooks: [
            { $match: { inStock: false } },
            { $count: 'count' }
          ],
          averageRating: [
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
          ],
          booksByGenre: [
            { $group: { _id: '$genre', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          booksByCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryInfo'
              }
            },
            { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: 1,
                categoryName: '$categoryInfo.name',
                count: 1
              }
            },
            { $sort: { count: -1 } }
          ],
          topRatedBooks: [
            { $match: { rating: { $gt: 0 } } },
            { $sort: { rating: -1 } },
            { $limit: 5 },
            { $project: { title: 1, rating: 1, author: 1 } }
          ]
        }
      }
    ]);
    
    // Populate authors for top rated books
    if (stats[0].topRatedBooks.length > 0) {
      await Book.populate(stats[0].topRatedBooks, {
        path: 'author',
        select: 'name'
      });
    }
    
    res.json({
      success: true,
      data: {
        totalBooks: stats[0].totalBooks[0]?.count || 0,
        inStockBooks: stats[0].inStockBooks[0]?.count || 0,
        outOfStockBooks: stats[0].outOfStockBooks[0]?.count || 0,
        averageRating: stats[0].averageRating[0]?.avgRating?.toFixed(2) || 0,
        booksByGenre: stats[0].booksByGenre,
        booksByCategory: stats[0].booksByCategory,
        topRatedBooks: stats[0].topRatedBooks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};