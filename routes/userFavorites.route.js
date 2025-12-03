const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userFavoritesController = require('../controllers/userFavorites.controller.js');

/**
 * @swagger
 * /favorites/{bookId}:
 *   post:
 *     summary: Toggle favorite for a book (add/remove)
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to toggle favorite
 *     responses:
 *       200:
 *         description: Toggle favorite successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     action:
 *                       type: string
 *                       enum: [added, removed]
 *                     bookId:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.post('/:bookId', authMiddleware, userFavoritesController.toggleFavorite);

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get all favorite books of the current user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, userFavoritesController.getUserFavorites);

/**
 * @swagger
 * /favorites/{bookId}/check:
 *   get:
 *     summary: Check if a book is favorited by the current user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to check favorite status
 *     responses:
 *       200:
 *         description: Favorite status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isFavorited:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/:bookId/check', authMiddleware, userFavoritesController.checkFavorite);

module.exports = router;
