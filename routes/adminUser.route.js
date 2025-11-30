const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {
  createAdmin,
  getAllAdmins,
  deleteAdmin
} = require('../controllers/adminUser.controller');

/**
 * @swagger
 * tags:
 *   name: AdminUser
 *   description: Admin user management endpoints
 */

/**
 * @swagger
 * /api/admin/users/create-admin:
 *   post:
 *     summary: Create a new admin user (super_admin only)
 *     tags: [AdminUser]
 *     security:
 *       - bearerAuth: []
 */
router.post('/users/create-admin', authMiddleware, authorizeRoles('super_admin'), createAdmin);

/**
 * @swagger
 * /api/admin/users/admins:
 *   get:
 *     summary: Get all admin users (super_admin only)
 *     tags: [AdminUser]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users/admins', authMiddleware, authorizeRoles('super_admin'), getAllAdmins);

/**
 * @swagger
 * /api/admin/users/admins/{id}:
 *   delete:
 *     summary: Delete an admin user (super_admin only)
 *     tags: [AdminUser]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/users/admins/:id', authMiddleware, authorizeRoles('super_admin'), deleteAdmin);

module.exports = router;