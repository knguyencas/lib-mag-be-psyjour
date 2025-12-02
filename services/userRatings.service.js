const Rating = require('../models/Rating');
const Book = require('../models/Book');
const ApiError = require('../utils/apiError');

class UserRatingsService {
  async generateRatingId() {
    const prefix = 'RT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  async submitRating(userId, bookId, ratingData) {
    const { rating, review } = ratingData;

    if (!rating || rating < 1 || rating > 5) {
      throw ApiError.badRequest('Rating must be between 1 and 5');
    }

    const book = await Book.findOne({ book_id: bookId });
    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    let existingRating = await Rating.findOne({ 
      user_id: userId, 
      book_id: bookId 
    });

    if (existingRating) {
      console.log(`Updating existing rating for user ${userId} on book ${bookId}`);
      existingRating.rating = rating;
      if (review !== undefined) {
        existingRating.review = review;
      }
      existingRating.status = 'approved';
      await existingRating.save();

      console.log(`Updated rating ${existingRating.rating_id} - ${rating} stars`);
      return existingRating;
    } else {
      const rating_id = await this.generateRatingId();
      
      console.log(`Creating new rating for user ${userId} on book ${bookId}`);
      const newRating = await Rating.create({
        rating_id,
        user_id: userId,
        book_id: bookId,
        rating,
        review: review || '',
        status: 'approved'
      });

      console.log(`Created rating ${rating_id} - ${rating} stars`);
      return newRating;
    }
  }

  async getUserRating(userId, bookId) {
    const rating = await Rating.findOne({ 
      user_id: userId, 
      book_id: bookId 
    });

    if (!rating) {
      return null;
    }

    return rating;
  }

  async deleteUserRating(userId, bookId) {
    const rating = await Rating.findOne({ 
      user_id: userId, 
      book_id: bookId 
    });

    if (!rating) {
      throw ApiError.notFound('Rating not found');
    }

    console.log(`Deleting rating ${rating.rating_id}`);
    
    await rating.remove();
    
    console.log(`Rating deleted, book average updated`);
  }

  async getBookRatings(bookId, queryParams = {}) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { 
      book_id: bookId,
      status: 'approved'
    };

    const [ratings, total] = await Promise.all([
      Rating.find(query)
        .populate('user_id', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Rating.countDocuments(query)
    ]);

    const stats = await Rating.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    return {
      ratings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        avgRating: 0,
        totalRatings: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
      }
    };
  }
}

module.exports = new UserRatingsService();