const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {
  getAllBooks,
  updateBook,
  deleteBook
} = require('../controllers/adminManageBooks.controller');

/**
 * @swagger
 * tags:
 *   name: AdminManageBooks
 *   description: Admin endpoints for managing existing books
 */

/**
 * @swagger
 * /api/admin/books/manage:
 *   get:
 *     summary: Get all books for management with filtering and sorting
 *     tags: [AdminManageBooks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/manage', authMiddleware, authorizeRoles('admin', 'super_admin'), getAllBooks);

/**
 * @swagger
 * /api/admin/books/manage/{id}:
 *   put:
 *     summary: Update book (admin/super_admin)
 *     tags: [AdminManageBooks]
 *     security:
 *       - bearerAuth: []
 */
router.put('/manage/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), updateBook);

/**
 * @swagger
 * /api/admin/books/manage/{id}:
 *   delete:
 *     summary: Delete book (admin/super_admin)
 *     tags: [AdminManageBooks]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/manage/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), deleteBook);

module.exports = router;