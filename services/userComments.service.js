const Comment = require('../models/Comment');
const Book = require('../models/Book');
const ApiError = require('../utils/apiError');

class UserCommentsService {
  async generateCommentId() {
    const prefix = 'CM';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  async postComment(userId, bookId, content) {
    if (!content || content.trim().length === 0) {
      throw ApiError.badRequest('Comment content is required');
    }

    if (content.length > 2000) {
      throw ApiError.badRequest('Comment cannot exceed 2000 characters');
    }

    const book = await Book.findOne({ book_id: bookId });
    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    const comment_id = await this.generateCommentId();
    
    const newComment = await Comment.create({
      comment_id,
      user_id: userId,
      target_type: 'perspective_post',
      target_id: bookId,
      content: content.trim(),
      status: 'approved',
      parent_comment_id: null
    });

    await newComment.populate('user_id', 'username email');

    console.log(`Created comment ${comment_id} on book ${bookId}`);
    return newComment;
  }

  async getBookComments(bookId, queryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { 
      target_id: bookId,
      status: 'approved',
      parent_comment_id: null
    };

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const comments = await Comment.find(filter)
      .populate('user_id', 'username')
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Comment.countDocuments(filter);

    return {
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateComment(userId, commentId, content) {
    const comment = await Comment.findOne({ comment_id: commentId });

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    if (comment.user_id.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only edit your own comments');
    }

    if (!content || content.trim().length === 0) {
      throw ApiError.badRequest('Comment content is required');
    }

    if (content.length > 2000) {
      throw ApiError.badRequest('Comment cannot exceed 2000 characters');
    }

    comment.content = content.trim();
    comment.edited = true;
    comment.edited_at = new Date();
    await comment.save();

    await comment.populate('user_id', 'username');

    console.log(`Updated comment ${commentId}`);
    return comment;
  }

  async deleteComment(userId, commentId) {
    const comment = await Comment.findOne({ comment_id: commentId });

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    if (comment.user_id.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    await Comment.deleteOne({ comment_id: commentId });

    console.log(`✅ Deleted comment ${commentId}`);
    return true;
  }

  async getUserComment(userId, bookId) {
    const comment = await Comment.findOne({ 
      user_id: userId,
      target_id: bookId,
      parent_comment_id: null
    });

    return comment;
  }
}

module.exports = new UserCommentsService();