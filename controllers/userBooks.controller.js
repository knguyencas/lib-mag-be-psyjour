const userRatingsService = require('../services/userRatings.service');
const userCommentsService = require('../services/userComments.service');
const Book = require('../models/Book');

const submitRating = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { rating, review } = req.body;

    const result = await userRatingsService.submitRating(userId, bookId, {
      rating,
      review,
    });

    const book = await Book.findOne({ book_id: bookId });

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: result,
        bookRating: book?.rating || 0,
        bookRatingCount: book?.rating_count || 0,
      },
    });
  } catch (error) {
    console.error('Error in rating submission:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to submit rating',
    });
  }
};

const getMyRating = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const rating = await userRatingsService.getUserRating(userId, bookId);

    res.status(200).json({
      success: true,
      message: 'User rating retrieved successfully',
      data: rating,
    });
  } catch (error) {
    console.error('Error getting user rating:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get rating',
    });
  }
};

const deleteMyRating = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    await userRatingsService.deleteUserRating(userId, bookId);

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete rating',
    });
  }
};

const getBookRatings = async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await userRatingsService.getBookRatings(bookId, req.query);

    res.status(200).json({
      success: true,
      message: 'Book ratings retrieved successfully',
      data: result.ratings,
      pagination: result.pagination,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Error getting book ratings:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get ratings',
    });
  }
};

const postComment = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const comment = await userCommentsService.postComment(userId, bookId, content);

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to post comment',
    });
  }
};

const getBookComments = async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await userCommentsService.getBookComments(bookId, req.query);

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: result.comments,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get comments',
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const comment = await userCommentsService.updateComment(userId, commentId, content);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update comment',
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    await userCommentsService.deleteComment(userId, commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete comment',
    });
  }
};

const getMyComment = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const comment = await userCommentsService.getUserComment(userId, bookId);

    res.status(200).json({
      success: true,
      message: 'User comment retrieved successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Error getting user comment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get comment',
    });
  }
};

module.exports = {
  submitRating,
  getMyRating,
  deleteMyRating,
  getBookRatings,
  postComment,
  getBookComments,
  updateComment,
  deleteComment,
  getMyComment,
};
