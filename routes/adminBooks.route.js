// routes/adminBooks.route.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminBooksController = require('../controllers/adminBooks.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
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
 *     summary: Create a new book (admin only)
 *     description: |
 *       Create new book, upload cover + ebook to Cloudinary, save metadata to MongoDB.
 *       primary_genre được auto xác định từ categories (pre-save hook trong Book model).
 *     tags: [AdminBooks]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               publisher:
 *                 type: string
 *               year:
 *                 type: number
 *               language:
 *                 type: string
 *               punchline:
 *                 type: string
 *               blurb:
 *                 type: string
 *               isbn:
 *                 type: string
 *               pageCount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               categories:
 *                 type: string
 *                 description: JSON array hoặc list tên category, ví dụ ["Psychology","Decision Science"]
 *               tags:
 *                 type: string
 *                 description: JSON array hoặc list tag, ví dụ ["dark academia","shadow work"]
 *               author_ids:
 *                 type: string
 *                 description: JSON array author_id đã tồn tại, ví dụ ["AU001","AU008"]
 *               new_authors:
 *                 type: string
 *                 description: JSON array author mới, ví dụ [{"name":"New Author"}]
 *               cover:
 *                 type: string
 *                 format: binary
 *               ebook:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.post(
  '/books',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'ebook', maxCount: 1 }
  ]),
  (req, res, next) => adminBooksController.createBook(req, res, next)
);

module.exports = router;
