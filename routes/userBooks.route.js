const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth');
const userBooksController = require('../controllers/userBooks.controller');

/**
 * @swagger
 * tags:
 *   name: UserBooks
 *   description: User endpoints for book ratings and comments
 */

/**
 * @swagger
 * /api/books/{bookId}/rate:
 *   post:
 *     summary: Submit or update a rating for a book
 *     tags: [UserBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID (book_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 5
 *               review:
 *                 type: string
 *                 description: Optional text review
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:bookId/rate',
  authMiddleware,
  userBooksController.submitRating
);

/**
 * @swagger
 * /api/books/{bookId}/my-rating:
 *   get:
 *     summary: Get current user's rating for a book
 *     tags: [UserBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID (book_id)
 *     responses:
 *       200:
 *         description: User rating retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:bookId/my-rating',
  authMiddleware,
  userBooksController.getMyRating
);

/**
 * @swagger
 * /api/books/{bookId}/my-rating:
 *   delete:
 *     summary: Delete current user's rating for a book
 *     tags: [UserBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID (book_id)
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:bookId/my-rating',
  authMiddleware,
  userBooksController.deleteMyRating
);

/**
 * @swagger
 * /api/books/{bookId}/ratings:
 *   get:
 *     summary: Get all ratings for a book
 *     tags: [UserBooks]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID (book_id)
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
 *     responses:
 *       200:
 *         description: Book ratings retrieved successfully
 */
router.get(
  '/:bookId/ratings',
  userBooksController.getBookRatings
);

/**
 * @swagger
 * /api/books/{bookId}/comments:
 *   post:
 *     summary: Post a comment for a book
 *     tags: [UserBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID (book_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *     responses:
 *       201:
 *         description: Comment posted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:bookId/comments',
  authMiddleware,
  userBooksController.postComment
);

/**
 * @swagger
 * /api/books/{bookId}/comments:
 *   get:
 *     summary: Get comments for a book
 *     tags: [UserBooks]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID (book_id)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 */
router.get(
  '/:bookId/comments',
  userBooksController.getBookComments
);

/**
 * @swagger
 * /api/books/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags: [UserBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the owner)
 */
router.put(
  '/comments/:commentId',
  authMiddleware,
  userBooksController.updateComment
);

/**
 * @swagger
 * /api/books/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [UserBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the owner)
 */
router.delete(
  '/comments/:commentId',
  authMiddleware,
  userBooksController.deleteComment
);

/**
 * @swagger
 * /api/books/{bookId}/my-comment:
 *   get:
 *     summary: Get current user's comment on a specific book
 *     tags: [UserBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID (book_id)
 *     responses:
 *       200:
 *         description: User comment retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:bookId/my-comment',
  authMiddleware,
  userBooksController.getMyComment
);

module.exports = router;
