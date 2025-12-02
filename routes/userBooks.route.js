const express = require('express');
const router = express.Router();

// VERSION 1: Destructured from auth.js (MOST COMMON)
// If this doesn't work, try V2 or V3
const { authMiddleware } = require('../middleware/auth');

const userRatingsService = require('../services/userRatings.service');
const userCommentsService = require('../services/userComments.service');

/**
 * @swagger
 * tags:
 *   name: UserBooks
 *   description: User endpoints for book ratings and comments
 */

// ==================== RATINGS ====================

/**
 * Submit or update rating for a book
 * POST /api/books/:bookId/rate
 */
router.post('/:bookId/rate', authMiddleware, async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { rating, review } = req.body;

    const result = await userRatingsService.submitRating(userId, bookId, {
      rating,
      review
    });

    // Get updated book rating
    const Book = require('../models/Book');
    const book = await Book.findOne({ book_id: bookId });

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: result,
        bookRating: book?.rating || 0,
        bookRatingCount: book?.rating_count || 0
      }
    });
  } catch (error) {
    console.error('Error in rating submission:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to submit rating'
    });
  }
});

/**
 * Get user's rating for a book
 * GET /api/books/:bookId/my-rating
 */
router.get('/:bookId/my-rating', authMiddleware, async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const rating = await userRatingsService.getUserRating(userId, bookId);

    res.status(200).json({
      success: true,
      message: 'User rating retrieved successfully',
      data: rating
    });
  } catch (error) {
    console.error('Error getting user rating:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get rating'
    });
  }
});

/**
 * Delete user's rating
 * DELETE /api/books/:bookId/my-rating
 */
router.delete('/:bookId/my-rating', authMiddleware, async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    await userRatingsService.deleteUserRating(userId, bookId);

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete rating'
    });
  }
});

/**
 * Get all ratings for a book (public)
 * GET /api/books/:bookId/ratings
 */
router.get('/:bookId/ratings', async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const result = await userRatingsService.getBookRatings(bookId, req.query);

    res.status(200).json({
      success: true,
      message: 'Book ratings retrieved successfully',
      data: result.ratings,
      pagination: result.pagination,
      stats: result.stats
    });
  } catch (error) {
    console.error('Error getting book ratings:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get ratings'
    });
  }
});

// ==================== COMMENTS ====================

/**
 * Post a comment on a book
 * POST /api/books/:bookId/comments
 */
router.post('/:bookId/comments', authMiddleware, async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const comment = await userCommentsService.postComment(userId, bookId, content);

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to post comment'
    });
  }
});

/**
 * Get comments for a book (public)
 * GET /api/books/:bookId/comments
 */
router.get('/:bookId/comments', async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const result = await userCommentsService.getBookComments(bookId, req.query);

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: result.comments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get comments'
    });
  }
});

// PUT /api/books/comments/:commentId
router.put('/comments/:commentId', authMiddleware, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const comment = await userCommentsService.updateComment(userId, commentId, content);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update comment'
    });
  }
});

// DELETE /api/books/comments/:commentId
router.delete('/comments/:commentId', authMiddleware, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    await userCommentsService.deleteComment(userId, commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete comment'
    });
  }
});

// GET /api/books/:bookId/my-comment
router.get('/:bookId/my-comment', authMiddleware, async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const comment = await userCommentsService.getUserComment(userId, bookId);

    res.status(200).json({
      success: true,
      message: 'User comment retrieved successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error getting user comment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get comment'
    });
  }
});

module.exports = router;