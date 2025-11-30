const VisualPost = require('../models/VisualPost');
const PerspectivePost = require('../models/PerspectivePost');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc    Get all visual posts
 * @route   GET /api/admin/posts/visual
 * @access  Admin, Super Admin
 */
const getAllVisualPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const posts = await VisualPost.find(filter)
      .populate('author_id', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VisualPost.countDocuments(filter);

    res.json(ApiResponse.paginated(posts, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }, 'Visual posts retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all perspective posts
 * @route   GET /api/admin/posts/perspective
 * @access  Admin, Super Admin
 */
const getAllPerspectivePosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const posts = await PerspectivePost.find(filter)
      .populate('author_id', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PerspectivePost.countDocuments(filter);

    res.json(ApiResponse.paginated(posts, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }, 'Perspective posts retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve visual post (change to published)
 * @route   PATCH /api/admin/posts/visual/:id/approve
 * @access  Admin, Super Admin
 */
const approveVisualPost = async (req, res, next) => {
  try {
    const post = await VisualPost.findOneAndUpdate(
      { post_id: req.params.id },
      { status: 'published' },
      { new: true }
    );

    if (!post) {
      throw ApiError.notFound('Visual post not found');
    }

    res.json(ApiResponse.success(post, 'Visual post approved and published'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve perspective post (change to published)
 * @route   PATCH /api/admin/posts/perspective/:id/approve
 * @access  Admin, Super Admin
 */
const approvePerspectivePost = async (req, res, next) => {
  try {
    const post = await PerspectivePost.findOneAndUpdate(
      { post_id: req.params.id },
      { status: 'published' },
      { new: true }
    );

    if (!post) {
      throw ApiError.notFound('Perspective post not found');
    }

    res.json(ApiResponse.success(post, 'Perspective post approved and published'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject visual post
 * @route   PATCH /api/admin/posts/visual/:id/reject
 * @access  Admin, Super Admin
 */
const rejectVisualPost = async (req, res, next) => {
  try {
    const post = await VisualPost.findOneAndUpdate(
      { post_id: req.params.id },
      { status: 'rejected' },
      { new: true }
    );

    if (!post) {
      throw ApiError.notFound('Visual post not found');
    }

    res.json(ApiResponse.success(post, 'Visual post rejected'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject perspective post
 * @route   PATCH /api/admin/posts/perspective/:id/reject
 * @access  Admin, Super Admin
 */
const rejectPerspectivePost = async (req, res, next) => {
  try {
    const post = await PerspectivePost.findOneAndUpdate(
      { post_id: req.params.id },
      { status: 'rejected' },
      { new: true }
    );

    if (!post) {
      throw ApiError.notFound('Perspective post not found');
    }

    res.json(ApiResponse.success(post, 'Perspective post rejected'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive visual post
 * @route   PATCH /api/admin/posts/visual/:id/archive
 * @access  Admin, Super Admin
 */
const archiveVisualPost = async (req, res, next) => {
  try {
    const post = await VisualPost.findOneAndUpdate(
      { post_id: req.params.id },
      { status: 'archived' },
      { new: true }
    );

    if (!post) {
      throw ApiError.notFound('Visual post not found');
    }

    res.json(ApiResponse.success(post, 'Visual post archived successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive perspective post
 * @route   PATCH /api/admin/posts/perspective/:id/archive
 * @access  Admin, Super Admin
 */
const archivePerspectivePost = async (req, res, next) => {
  try {
    const post = await PerspectivePost.findOneAndUpdate(
      { post_id: req.params.id },
      { status: 'archived' },
      { new: true }
    );

    if (!post) {
      throw ApiError.notFound('Perspective post not found');
    }

    res.json(ApiResponse.success(post, 'Perspective post archived successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete visual post
 * @route   DELETE /api/admin/posts/visual/:id
 * @access  Admin, Super Admin
 */
const deleteVisualPost = async (req, res, next) => {
  try {
    const post = await VisualPost.findOneAndDelete({ post_id: req.params.id });

    if (!post) {
      throw ApiError.notFound('Visual post not found');
    }

    res.json(ApiResponse.success(null, 'Visual post deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete perspective post
 * @route   DELETE /api/admin/posts/perspective/:id
 * @access  Admin, Super Admin
 */
const deletePerspectivePost = async (req, res, next) => {
  try {
    const post = await PerspectivePost.findOneAndDelete({ post_id: req.params.id });

    if (!post) {
      throw ApiError.notFound('Perspective post not found');
    }

    res.json(ApiResponse.success(null, 'Perspective post deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVisualPosts,
  getAllPerspectivePosts,
  approveVisualPost,
  approvePerspectivePost,
  rejectVisualPost,
  rejectPerspectivePost,
  archiveVisualPost,
  archivePerspectivePost,
  deleteVisualPost,
  deletePerspectivePost
};