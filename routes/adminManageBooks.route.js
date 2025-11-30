const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const Book = require('../models/Book');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @swagger
 * tags:
 *   name: AdminManageBooks
 *   description: Admin endpoints for managing existing books (edit, delete, publish)
 */

/**
 * @swagger
 * /api/admin/books/manage:
 *   get:
 *     summary: Get all books for management (admin/super_admin)
 *     tags: [AdminManageBooks]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 */
router.get('/manage', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { book_id: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(filter);

    res.json(ApiResponse.paginated(books, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }, 'Books retrieved successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/books/manage/{id}:
 *   put:
 *     summary: Update book (admin/super_admin)
 *     tags: [AdminManageBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Book updated successfully
 */
router.put('/manage/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
  try {
    const book = await Book.findOneAndUpdate(
      { book_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    res.json(ApiResponse.success(book, 'Book updated successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/books/manage/{id}:
 *   delete:
 *     summary: Delete book (admin/super_admin)
 *     tags: [AdminManageBooks]
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
 *         description: Book deleted successfully
 */
router.delete('/manage/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), async (req, res, next) => {
  try {
    const book = await Book.findOneAndDelete({ book_id: req.params.id });

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    res.json(ApiResponse.success(null, 'Book deleted successfully'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;