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

// Visual Posts Routes
router.get('/visual', authMiddleware, authorizeRoles('admin', 'super_admin'), getAllVisualPosts);
router.patch('/visual/:id/approve', authMiddleware, authorizeRoles('admin', 'super_admin'), approveVisualPost);
router.patch('/visual/:id/reject', authMiddleware, authorizeRoles('admin', 'super_admin'), rejectVisualPost);
router.patch('/visual/:id/archive', authMiddleware, authorizeRoles('admin', 'super_admin'), archiveVisualPost);
router.delete('/visual/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), deleteVisualPost);

// Perspective Posts Routes
router.get('/perspective', authMiddleware, authorizeRoles('admin', 'super_admin'), getAllPerspectivePosts);
router.patch('/perspective/:id/approve', authMiddleware, authorizeRoles('admin', 'super_admin'), approvePerspectivePost);
router.patch('/perspective/:id/reject', authMiddleware, authorizeRoles('admin', 'super_admin'), rejectPerspectivePost);
router.patch('/perspective/:id/archive', authMiddleware, authorizeRoles('admin', 'super_admin'), archivePerspectivePost);
router.delete('/perspective/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), deletePerspectivePost);

module.exports = router;