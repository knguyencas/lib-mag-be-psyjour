const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminBooksController = require('../controllers/adminBooks.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

/**
 * @swagger
 * tags:
 *   name: AdminBooks
 *   description: Admin endpoints for managing books
 */

/**
 * @swagger
 * /api/admin/books:
 *   post:
 *     summary: Create a new book (Admin only)
 *     tags: [AdminBooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               primary_genre:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               epubFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/books',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  upload.any(),
  (req, res, next) => adminBooksController.createBook(req, res, next)
);

/**
 * @swagger
 * /api/admin/books/manage:
 *   get:
 *     summary: Get list of books for admin management
 *     tags: [AdminBooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of managed books
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/books/manage',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  (req, res, next) => adminBooksController.getManageBooks(req, res, next)
);

/**
 * @swagger
 * /api/admin/books/manage/{bookId}:
 *   get:
 *     summary: Get book detail for admin by ID
 *     tags: [AdminBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book detail fetched successfully
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/books/manage/:bookId',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  (req, res, next) => adminBooksController.getBookById(req, res, next)
);

/**
 * @swagger
 * /api/admin/books/manage/{bookId}:
 *   put:
 *     summary: Update book information (Admin only)
 *     tags: [AdminBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               primary_genre:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               epubFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid update data
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  '/books/manage/:bookId',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  upload.any(),
  (req, res, next) => adminBooksController.updateBook(req, res, next)
);

/**
 * @swagger
 * /api/admin/books/manage/{bookId}:
 *   delete:
 *     summary: Delete a book (Admin only)
 *     tags: [AdminBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/books/manage/:bookId',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  (req, res, next) => adminBooksController.deleteBook(req, res, next)
);

module.exports = router;
