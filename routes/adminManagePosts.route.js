const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const VisualPost = require('../models/VisualPost');
const PerspectivePost = require('../models/PerspectivePost');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @swagger
 * tags:
 *   name: AdminManagePosts
 *   description: Admin endpoints for managing user posts
 */

/**
 * @swagger
 * /api/admin/posts/visual:
 *   get:
 *     summary: Get all visual posts (admin/super_admin)
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visual posts retrieved successfully
 */
router.get('/visual', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
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
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }, 'Visual posts retrieved successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/posts/perspective:
 *   get:
 *     summary: Get all perspective posts (admin/super_admin)
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perspective posts retrieved successfully
 */
router.get('/perspective', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
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
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }, 'Perspective posts retrieved successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/posts/visual/{id}:
 *   delete:
 *     summary: Delete visual post (admin/super_admin)
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete('/visual/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
  try {
    const post = await VisualPost.findOneAndDelete({ post_id: req.params.id });

    if (!post) {
      throw ApiError.notFound('Visual post not found');
    }

    res.json(ApiResponse.success(null, 'Visual post deleted successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/posts/perspective/{id}:
 *   delete:
 *     summary: Delete perspective post (admin/super_admin)
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete('/perspective/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
  try {
    const post = await PerspectivePost.findOneAndDelete({ post_id: req.params.id });

    if (!post) {
      throw ApiError.notFound('Perspective post not found');
    }

    res.json(ApiResponse.success(null, 'Perspective post deleted successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/posts/visual/{id}/archive:
 *   patch:
 *     summary: Archive visual post (admin/super_admin)
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post archived successfully
 */
router.patch('/visual/:id/archive', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
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
});

/**
 * @swagger
 * /api/admin/posts/perspective/{id}/archive:
 *   patch:
 *     summary: Archive perspective post (admin/super_admin)
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post archived successfully
 */
router.patch('/perspective/:id/archive', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
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
});

module.exports = router;