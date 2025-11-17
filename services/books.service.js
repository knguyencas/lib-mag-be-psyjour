const Book = require('../models/Book');
const Category = require('../models/Category');
const ApiError = require('../utils/apiError');

class BookService {
  async getAllBooks(queryParams) {
    const {
      page = 1,
      limit = 20,
      primary_genre,
      category,
      tag,
      status = 'published',
      search,
      minRating,
      maxRating,
      featured,
      sortBy = 'newest'
    } = queryParams;

    const filter = { status };

    if (primary_genre) {
      const categoryNames = await Category.getCategoryNamesForPrimaryGenre(primary_genre);

      if (categoryNames.length > 0) {
        filter.categories = { $in: categoryNames };
      } else {
        filter.primary_genre = primary_genre;
      }
    } else if (category) {
      filter.categories = category;
    }

    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };
    if (featured !== undefined) filter.featured = featured === 'true';

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = parseFloat(minRating);
      if (maxRating) filter.rating.$lte = parseFloat(maxRating);
    }

    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'views':
        sort = { view_count: -1 };
        break;
      case 'downloads':
        sort = { download_count: -1 };
        break;
      case 'oldest':
        sort = { year: 1 };
        break;
      case 'newest':
      default:
        sort = { year: -1, createdAt: -1 }; 
    }

    const skip = (page - 1) * limit;
    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(filter);

    return {
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getBookById(bookId) {
    const book = await Book.findOne({ book_id: bookId });

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    await book.incrementViewCount();

    return book;
  }

  async createBook(bookData) {
    try {
      const book = new Book(bookData);
      await book.save();
      return book;
    } catch (error) {
      if (error.code === 11000) {
        throw ApiError.conflict('Book with this ID or ISBN already exists');
      }
      throw error;
    }
  }

  async updateBook(bookId, updateData) {
    const book = await Book.findOneAndUpdate(
      { book_id: bookId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    return book;
  }

  async deleteBook(bookId) {
    const book = await Book.findOneAndDelete({ book_id: bookId });

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    return book;
  }

  async getBooksByGenre(genre) {
    const categoryNames = await Category.getCategoryNamesForPrimaryGenre(genre);

    const filter = { status: 'published' };

    if (categoryNames.length > 0) {
      filter.categories = { $in: categoryNames };
    } else {
      filter.primary_genre = genre;
    }

    const books = await Book.find(filter).sort({ rating: -1 });

    return books;
  }

  async getBooksByCategory(category) {
    const books = await Book.find({
      categories: category,
      status: 'published'
    }).sort({ rating: -1 });

    return books;
  }

  async getBooksByTag(tag) {
    const books = await Book.find({
      tags: tag,
      status: 'published'
    }).sort({ rating: -1 });

    return books;
  }

  async getBooksByAuthor(authorId) {
    const books = await Book.find({
      author_id: authorId,
      status: 'published'
    }).sort({ year: -1 });

    return books;
  }

  async getStatsOverview() {
    const totalBooks = await Book.countDocuments({ status: 'published' });

    const viewsData = await Book.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$view_count' } } }
    ]);

    const downloadsData = await Book.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$download_count' } } }
    ]);

    const genreStats = await Book.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$primary_genre',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const ratingData = await Book.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    return {
      totalBooks,
      totalViews: viewsData[0]?.total || 0,
      totalDownloads: downloadsData[0]?.total || 0,
      avgRating: ratingData[0]?.avg || 0,
      genreDistribution: genreStats
    };
  }

  async getTopRatedByCategory() {
    const result = await Book.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$categories' },
      { $sort: { rating: -1 } },
      {
        $group: {
          _id: '$categories',
          books: {
            $push: {
              book_id: '$book_id',
              title: '$title',
              author: '$author',
              rating: '$rating',
              coverImage_cloud: '$coverImage_cloud'
            }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          books: { $slice: ['$books', 10] }
        }
      },
      { $sort: { category: 1 } }
    ]);

    return result;
  }

  async updateStatus(bookId, status) {
    const book = await Book.findOneAndUpdate(
      { book_id: bookId },
      { status },
      { new: true, runValidators: true }
    );

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    return book;
  }

  async updateRating(bookId, rating) {
    const book = await Book.findOneAndUpdate(
      { book_id: bookId },
      { rating },
      { new: true, runValidators: true }
    );

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    return book;
  }

  async toggleFeatured(bookId, featured) {
    const book = await Book.findOneAndUpdate(
      { book_id: bookId },
      { featured },
      { new: true, runValidators: true }
    );

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    return book;
  }

  async incrementDownload(bookId) {
    const book = await Book.findOne({ book_id: bookId });

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    await book.incrementDownloadCount();

    return {
      download_count: book.download_count
    };
  }

  getPrimaryGenres() {
    return Book.getPrimaryGenres();
  }

  getAllCategories() {
    return Book.getAllCategories();
  }

  getCategoriesByGenre(genre) {
    return Book.getCategoriesByGenre(genre);
  }

  getAllTags() {
    return Book.getAllTags();
  }

  getTagsByGenre(genre) {
    return Book.getTagsByGenre(genre);
  }

  async searchBooks(searchParams) {
    const {
      keyword,
      genre,
      categories,
      tags,
      minRating,
      maxRating,
      author,
      year,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = searchParams;

    const filter = { status: 'published' };

    if (keyword) {
      const searchRegex = new RegExp(keyword, 'i'); // case-insensitive
      
      filter.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { blurb: searchRegex },
        { punchline: searchRegex },
        { primary_genre: searchRegex },
        { categories: searchRegex },
        { tags: keyword.toLowerCase() },
        { publisher: searchRegex }
      ];
    }

    if (genre && !keyword) {
      filter.primary_genre = genre;
    }
    
    if (categories && categories.length > 0 && !keyword) {
      filter.categories = { $in: categories };
    }
    
    if (tags && tags.length > 0 && !keyword) {
      filter.tags = { $in: tags };
    }
    
    if (author && !keyword) {
      filter.author = new RegExp(author, 'i');
    }
    
    if (year) {
      filter.year = year;
    }

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = parseFloat(minRating);
      if (maxRating) filter.rating.$lte = parseFloat(maxRating);
    }

    // Sort
    let sort = {};
    switch (sortBy) {
      case 'relevance':
        sort = { rating: -1, view_count: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'newest':
        sort = { year: -1, createdAt: -1 };
        break;
      case 'oldest':
        sort = { year: 1, createdAt: 1 };
        break;
      case 'title':
        sort = { title: 1 };
        break;
      default:
        sort = { rating: -1 };
    }

    // Execute query
    const skip = (page - 1) * limit;
    
    // Log để debug
    console.log('=== SEARCH DEBUG ===');
    console.log('Keyword:', keyword);
    console.log('Filter:', JSON.stringify(filter, null, 2));
    console.log('Sort:', sort);
    console.log('Page:', page, 'Limit:', limit);
    
    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(filter);

    console.log(`Search found ${total} books for keyword: "${keyword}"`);
    console.log('===================\n');

    return {
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getFeaturedBooks(limit = 10) {
    const books = await Book.find({
      featured: true,
      status: 'published'
    })
      .sort({ rating: -1 })
      .limit(limit);

    return books;
  }

  async getRelatedBooks(bookId, limit = 5) {
    const book = await Book.findOne({ book_id: bookId });

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    const relatedBooks = await Book.find({
      book_id: { $ne: bookId },
      $or: [
        { primary_genre: book.primary_genre },
        { categories: { $in: book.categories } },
        { tags: { $in: book.tags } }
      ],
      status: 'published'
    })
      .limit(limit)
      .sort({ rating: -1 });

    return relatedBooks;
  }

  async getPopularBooks(limit = 10) {
    const books = await Book.find({
      status: 'published'
    })
      .sort({ 
        view_count: -1,
        rating: -1,
        download_count: -1
      })
      .limit(limit);

    return books;
  }
}

module.exports = new BookService();