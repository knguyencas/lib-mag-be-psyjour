const Author = require('../models/Author');
const Book = require('../models/Book');

// GET /api/authors
exports.getAllAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, nationality, sortBy = 'name', order = 'asc' } = req.query;
    
    const query = {};
    
    if (nationality) query.nationality = nationality;
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };
    
    const authors = await Author.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);
    
    const count = await Author.countDocuments(query);
    
    res.json({
      success: true,
      data: authors,
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

// GET /api/authors/:id
exports.getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    const books = await Book.find({ author: req.params.id })
      .populate('category', 'name slug');
    
    res.json({
      success: true,
      data: {
        ...author.toObject(),
        books: books
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

// POST /api/authors
exports.createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    
    res.status(201).json({
      success: true,
      data: author,
      message: 'Author created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Author with this email already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to create author',
      error: error.message
    });
  }
};

// @route   PUT /api/authors/:id
exports.updateAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    res.json({
      success: true,
      data: author,
      message: 'Author updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update author',
      error: error.message
    });
  }
};

// DELETE /api/authors/:id
exports.deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    const booksCount = await Book.countDocuments({ author: req.params.id });
    
    if (booksCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete author with ${booksCount} associated books. Delete books first or reassign them to another author.`
      });
    }
    
    await Author.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Author deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// GET /api/authors/:id/stats
exports.getAuthorStats = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    const books = await Book.find({ author: req.params.id })
      .populate('category', 'name');
    
    const stats = {
      totalBooks: books.length,
      averageRating: books.length > 0 
        ? (books.reduce((sum, book) => sum + book.rating, 0) / books.length).toFixed(2)
        : 0,
      totalPages: books.reduce((sum, book) => sum + (book.pages || 0), 0),
      genres: [...new Set(books.map(book => book.genre))],
      categories: [...new Set(books.map(book => book.category?.name).filter(Boolean))],
      inStockBooks: books.filter(book => book.inStock).length,
      outOfStockBooks: books.filter(book => !book.inStock).length,
      highestRatedBook: books.reduce((max, book) => 
        book.rating > (max?.rating || 0) ? book : max, null
      ),
      mostRecentBook: books.length > 0 
        ? books.reduce((latest, book) => 
            (!latest || new Date(book.publishedDate) > new Date(latest.publishedDate)) ? book : latest
          , null)
        : null
    };
    
    res.json({
      success: true,
      data: {
        author: author,
        statistics: stats
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

// GET /api/authors/nationality/:nationality
exports.getAuthorsByNationality = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const authors = await Author.find({ nationality: req.params.nationality })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });
    
    const count = await Author.countDocuments({ nationality: req.params.nationality });
    
    res.json({
      success: true,
      data: authors,
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

// GET /api/authors/search
exports.searchAuthors = async (req, res) => {
  try {
    const { query, nationality, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { biography: { $regex: query, $options: 'i' } }
      ]
    };
    
    if (nationality) {
      searchQuery.nationality = nationality;
    }
    
    const authors = await Author.find(searchQuery)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: authors,
      count: authors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// GET /api/authors/top-by-books
exports.getTopAuthorsByBookCount = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topAuthors = await Book.aggregate([
      {
        $group: {
          _id: '$author',
          bookCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalPages: { $sum: '$pages' }
        }
      },
      { $sort: { bookCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'authors',
          localField: '_id',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' },
      {
        $project: {
          _id: '$authorInfo._id',
          name: '$authorInfo.name',
          nationality: '$authorInfo.nationality',
          email: '$authorInfo.email',
          bookCount: 1,
          averageRating: { $round: ['$averageRating', 2] },
          totalPages: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: topAuthors,
      count: topAuthors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// GET /api/authors/top-by-rating
exports.getTopAuthorsByRating = async (req, res) => {
  try {
    const { limit = 10, minBooks = 1 } = req.query;
    
    const topAuthors = await Book.aggregate([
      { $match: { rating: { $gt: 0 } } },
      {
        $group: {
          _id: '$author',
          bookCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          highestRating: { $max: '$rating' }
        }
      },
      { $match: { bookCount: { $gte: parseInt(minBooks) } } },
      { $sort: { averageRating: -1, bookCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'authors',
          localField: '_id',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' },
      {
        $project: {
          _id: '$authorInfo._id',
          name: '$authorInfo.name',
          nationality: '$authorInfo.nationality',
          bookCount: 1,
          averageRating: { $round: ['$averageRating', 2] },
          highestRating: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: topAuthors,
      count: topAuthors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// GET /api/authors/nationalities
exports.getAllNationalities = async (req, res) => {
  try {
    const nationalities = await Author.distinct('nationality');
    
    res.json({
      success: true,
      data: nationalities.filter(Boolean).sort(),
      count: nationalities.filter(Boolean).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};