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
 * /books/{bookId}/progress:
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
 *         description: Book ID (vd: BK001)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chapter_index:
 *                 type: integer
 *               scroll_position:
 *                 type: number
 *               progress_percentage:
 *                 type: number
 *             example:
 *               chapter_index: 3
 *               scroll_position: 0
 *               progress_percentage: 25
 *     responses:
 *       200:
 *         description: Progress updated
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/books/:bookId/progress',
  authMiddleware,
  readingProgressController.updateProgress
);

/**
 * @swagger
 * /books/{bookId}/progress:
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
 *       404:
 *         description: No progress found
 */
router.get(
  '/books/:bookId/progress',
  authMiddleware,
  readingProgressController.getProgress
);

/**
 * @swagger
 * /reading/recently-read:
 *   get:
 *     summary: Get list of recently read books of current user
 *     tags: [ReadingProgress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (optional, default 10)
 *     responses:
 *       200:
 *         description: Successfully returned recently read books
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/reading/recently-read',
  authMiddleware,
  readingProgressController.getRecentlyRead
);

/**
 * @swagger
 * /books/{bookId}/progress:
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
  '/books/:bookId/progress',
  authMiddleware,
  readingProgressController.deleteProgress
);

module.exports = router;
