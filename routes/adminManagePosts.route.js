const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {
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
} = require('../controllers/adminManagePosts.controller');

/**
 * @swagger
 * tags:
 *   name: AdminManagePosts
 *   description: Admin endpoints for managing user posts
 */

/**
 * @swagger
 * /admin/posts/visual:
 *   get:
 *     summary: Get all visual posts
 *     description: Retrieve a paginated list of visual posts. Can be filtered by status.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, published, rejected, archived]
 *         description: Filter posts by status
 *     responses:
 *       200:
 *         description: Visual posts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
  '/visual',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  getAllVisualPosts
);

/**
 * @swagger
 * /admin/posts/visual/{id}/approve:
 *   patch:
 *     summary: Approve a visual post
 *     description: Change status of a visual post to `published`.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Visual post_id (e.g. VP001)
 *     responses:
 *       200:
 *         description: Visual post approved and published
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Visual post not found
 */
router.patch(
  '/visual/:id/approve',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  approveVisualPost
);

/**
 * @swagger
 * /admin/posts/visual/{id}/reject:
 *   patch:
 *     summary: Reject a visual post
 *     description: Change status of a visual post to `rejected`.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Visual post_id (e.g. VP001)
 *     responses:
 *       200:
 *         description: Visual post rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Visual post not found
 */
router.patch(
  '/visual/:id/reject',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  rejectVisualPost
);

/**
 * @swagger
 * /admin/posts/visual/{id}/archive:
 *   patch:
 *     summary: Archive a visual post
 *     description: Change status of a visual post to `archived`.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Visual post_id (e.g. VP001)
 *     responses:
 *       200:
 *         description: Visual post archived successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Visual post not found
 */
router.patch(
  '/visual/:id/archive',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  archiveVisualPost
);

/**
 * @swagger
 * /admin/posts/visual/{id}:
 *   delete:
 *     summary: Delete a visual post
 *     description: Permanently delete a visual post by post_id.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Visual post_id (e.g. VP001)
 *     responses:
 *       200:
 *         description: Visual post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Visual post not found
 */
router.delete(
  '/visual/:id',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  deleteVisualPost
);

/**
 * @swagger
 * /admin/posts/perspective:
 *   get:
 *     summary: Get all perspective posts
 *     description: Retrieve a paginated list of perspective posts. Can be filtered by status.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, published, rejected, archived]
 *         description: Filter posts by status
 *     responses:
 *       200:
 *         description: Perspective posts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
  '/perspective',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  getAllPerspectivePosts
);

/**
 * @swagger
 * /admin/posts/perspective/{id}/approve:
 *   patch:
 *     summary: Approve a perspective post
 *     description: Change status of a perspective post to `published`.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Perspective post_id (e.g. PP001)
 *     responses:
 *       200:
 *         description: Perspective post approved and published
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Perspective post not found
 */
router.patch(
  '/perspective/:id/approve',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  approvePerspectivePost
);

/**
 * @swagger
 * /admin/posts/perspective/{id}/reject:
 *   patch:
 *     summary: Reject a perspective post
 *     description: Change status of a perspective post to `rejected`.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Perspective post_id (e.g. PP001)
 *     responses:
 *       200:
 *         description: Perspective post rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Perspective post not found
 */
router.patch(
  '/perspective/:id/reject',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  rejectPerspectivePost
);

/**
 * @swagger
 * /admin/posts/perspective/{id}/archive:
 *   patch:
 *     summary: Archive a perspective post
 *     description: Change status of a perspective post to `archived`.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Perspective post_id (e.g. PP001)
 *     responses:
 *       200:
 *         description: Perspective post archived successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Perspective post not found
 */
router.patch(
  '/perspective/:id/archive',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  archivePerspectivePost
);

/**
 * @swagger
 * /admin/posts/perspective/{id}:
 *   delete:
 *     summary: Delete a perspective post
 *     description: Permanently delete a perspective post by post_id.
 *     tags: [AdminManagePosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Perspective post_id (e.g. PP001)
 *     responses:
 *       200:
 *         description: Perspective post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Perspective post not found
 */
router.delete(
  '/perspective/:id',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  deletePerspectivePost
);

module.exports = router;