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

  _getTargetType(targetId) {
    if (targetId.startsWith('BK')) {
      return 'book';
    } else if (targetId.startsWith('PP')) {
      return 'perspective_post';
    }
    throw ApiError.badRequest('Invalid target ID format');
  }

  async _validateTarget(targetType, targetId) {
    let Model;
    let idField;
    
    if (targetType === 'book') {
      Model = Book;
      idField = 'book_id';
    } else if (targetType === 'perspective_post') {
      Model = require('../models/PerspectivePost');
      idField = 'post_id';
    } else {
      throw ApiError.badRequest('Invalid target type');
    }
    
    const target = await Model.findOne({ [idField]: targetId });
    if (!target) {
      const entityName = targetType === 'book' ? 'Book' : 'Perspective Post';
      throw ApiError.notFound(`${entityName} not found`);
    }
    
    return target;
  }

  /**
   * Post comment on Book or PerspectivePost
   * @param {String} userId - User ObjectId
   * @param {String} targetId - BK001 or PP001
   * @param {String} content - Comment content
   */
  async postComment(userId, targetId, content) {
    if (!content || content.trim().length === 0) {
      throw ApiError.badRequest('Comment content is required');
    }

    if (content.length > 2000) {
      throw ApiError.badRequest('Comment cannot exceed 2000 characters');
    }

    const targetType = this._getTargetType(targetId);
    
    await this._validateTarget(targetType, targetId);

    const comment_id = await this.generateCommentId();
    
    const newComment = await Comment.create({
      comment_id,
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      content: content.trim(),
      status: 'approved',
      parent_comment_id: null
    });

    await newComment.populate('user_id', 'username email');

    console.log(`Created comment ${comment_id} on ${targetType} ${targetId}`);
    return newComment;
  }

  /**
   * Get comments for Book or PerspectivePost
   * @param {String} targetId
   * @param {Object} queryParams
   */
  async getComments(targetId, queryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const targetType = this._getTargetType(targetId);

    const filter = { 
      target_type: targetType,
      target_id: targetId,
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

  async getBookComments(bookId, queryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { 
      target_type: { $in: ['book', 'perspective_post'] },
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

  async getPerspectivePostComments(postId, queryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = { 
      target_type: 'perspective_post',
      target_id: postId,
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

    console.log(`Deleting comment ${commentId} (${comment.target_type}: ${comment.target_id})`);
    
    await Comment.deleteOne({ comment_id: commentId });

    console.log(`Deleted comment ${commentId}`);
    return true;
  }

  async getUserComment(userId, targetId) {
    const targetType = this._getTargetType(targetId);
    
    const comment = await Comment.findOne({ 
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      parent_comment_id: null
    });

    return comment;
  }

  async getUserBookComment(userId, bookId) {
    const comment = await Comment.findOne({ 
      user_id: userId,
      target_type: { $in: ['book', 'perspective_post'] },
      target_id: bookId,
      parent_comment_id: null
    });

    return comment;
  }
}

module.exports = new UserCommentsService();