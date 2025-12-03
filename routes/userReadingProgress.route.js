const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const readingProgressController = require('../controllers/userReadingProgress.controller');

/**
 * @swagger
 * tags:
 *   name: ReadingProgress
 *   description: Track user reading progress
 */

/**
 * @swagger
 * /reading-progress/recently-read/list:
 *   get:
 *     summary: Get list of recently read books of current user
 *     tags: [ReadingProgress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (optional)
 *     responses:
 *       200:
 *         description: Successfully returned recently read books
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/recently-read/list',
  authMiddleware,
  readingProgressController.getRecentlyRead
);

/**
 * @swagger
 * /reading-progress/{bookId}:
 *   post:
 *     summary: Update reading progress for a book
 *     tags: [ReadingProgress]
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
 *         application/json:
 *           schema:
 *             type: object
 *             description: Progress payload (position, percentage, timestamps, etc.)
 *     responses:
 *       200:
 *         description: Progress updated
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:bookId',
  authMiddleware,
  readingProgressController.updateProgress
);

/**
 * @swagger
 * /reading-progress/{bookId}:
 *   get:
 *     summary: Get reading progress for a specific book
 *     tags: [ReadingProgress]
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
 *         description: Progress returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:bookId',
  authMiddleware,
  readingProgressController.getProgress
);

/**
 * @swagger
 * /reading-progress/{bookId}:
 *   delete:
 *     summary: Delete reading progress for a book
 *     tags: [ReadingProgress]
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
 *         description: Progress deleted
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:bookId',
  authMiddleware,
  readingProgressController.deleteProgress
);

module.exports = router;
