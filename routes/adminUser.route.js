const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const adminUserController = require('../controllers/adminUser.controller');

/**
 * @swagger
 * tags:
 *   name: AdminUsers
 *   description: Super admin endpoints for managing admin users
 */

/**
 * @swagger
 * /api/admin/users/create-admin:
 *   post:
 *     summary: Create new admin user (super_admin only)
 *     description: |
 *       Only super_admin can create new admin users.
 *       Email is optional.
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: admin_user1
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Optional email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden (not super_admin)
 *       409:
 *         description: Username or email already exists
 */
router.post(
  '/users/create-admin',
  authMiddleware,
  authorizeRoles('super_admin'),
  (req, res, next) => adminUserController.createAdmin(req, res, next)
);

/**
 * @swagger
 * /api/admin/users/admins:
 *   get:
 *     summary: Get all admin users (super_admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin list retrieved successfully
 *       403:
 *         description: Forbidden (not super_admin)
 */
router.get(
  '/users/admins',
  authMiddleware,
  authorizeRoles('super_admin'),
  (req, res, next) => adminUserController.getAllAdmins(req, res, next)
);

/**
 * @swagger
 * /api/admin/users/admins/{id}:
 *   delete:
 *     summary: Delete admin user (super_admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user ID
 *     responses:
 *       200:
 *         description: Admin user deleted successfully
 *       403:
 *         description: Forbidden (not super_admin)
 *       404:
 *         description: Admin user not found
 */
router.delete(
  '/users/admins/:id',
  authMiddleware,
  authorizeRoles('super_admin'),
  (req, res, next) => adminUserController.deleteAdmin(req, res, next)
);

module.exports = router;