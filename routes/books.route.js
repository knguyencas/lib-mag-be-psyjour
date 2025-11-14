const express = require('express');
const router = express.Router();
const bookController = require('../controllers/books.controller.js');

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with pagination and filters
 *     tags: [Books]
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
 *       - in: query
 *         name: primary_genre
 *         schema:
 *           type: string
 *         description: Filter by primary genre
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, author, and blurb
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *         description: Maximum rating
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, rating, views, downloads]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', bookController.getAllBooks);

/**
 * @swagger
 * /books/stats/overview:
 *   get:
 *     summary: Get book statistics overview
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats/overview', bookController.getStatsOverview);

/**
 * @swagger
 * /books/top-rated-by-category:
 *   get:
 *     summary: Get top 10 books by rating for every category
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/top-rated-by-category', bookController.getTopRatedByCategory);

/**
 * @swagger
 * /books/featured:
 *   get:
 *     summary: Get featured books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of books to return
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/featured', bookController.getFeaturedBooks);

/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Advanced search for books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/search', bookController.searchBooks);

/**
 * @swagger
 * /books/author/{authorId}:
 *   get:
 *     summary: Get all books by a specific author
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/author/:authorId', bookController.getBooksByAuthor);

/**
 * @swagger
 * /books/category/{category}:
 *   get:
 *     summary: Get all books by a specific category
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/category/:category', bookController.getBooksByCategory);

/**
 * @swagger
 * /books/genre/{genre}:
 *   get:
 *     summary: Get all books by a specific primary genre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/genre/:genre', bookController.getBooksByGenre);

/**
 * @swagger
 * /books/tags/{tag}:
 *   get:
 *     summary: Get all books by a specific tag
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/tags/:tag', bookController.getBooksByTag);

/**
 * @swagger
 * /books/metadata/genres:
 *   get:
 *     summary: Get all available primary genres
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/metadata/genres', bookController.getPrimaryGenres);

/**
 * @swagger
 * /books/metadata/categories:
 *   get:
 *     summary: Get all categories (grouped by genre)
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/metadata/categories', bookController.getAllCategories);

/**
 * @swagger
 * /books/metadata/categories/{genre}:
 *   get:
 *     summary: Get categories by genre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/metadata/categories/:genre', bookController.getCategoriesByGenre);

/**
 * @swagger
 * /books/metadata/tags:
 *   get:
 *     summary: Get all tags (grouped by genre)
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/metadata/tags', bookController.getAllTags);

/**
 * @swagger
 * /books/metadata/tags/{genre}:
 *   get:
 *     summary: Get tags by genre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/metadata/tags/:genre', bookController.getTagsByGenre);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID (book_id field)
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Book not found
 */
router.get('/:id', bookController.getBookById);

/**
 * @swagger
 * /books/{id}/related:
 *   get:
 *     summary: Get related books
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id/related', bookController.getRelatedBooks);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', bookController.createBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
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
 *       404:
 *         description: Book not found
 */
router.put('/:id', bookController.updateBook);

/**
 * @swagger
 * /books/{id}/status:
 *   patch:
 *     summary: Update book status
 *     tags: [Books]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', bookController.updateStatus);

/**
 * @swagger
 * /books/{id}/rating:
 *   patch:
 *     summary: Update book rating
 *     tags: [Books]
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
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Rating updated
 */
router.patch('/:id/rating', bookController.updateRating);

/**
 * @swagger
 * /books/{id}/featured:
 *   patch:
 *     summary: Toggle book featured status
 *     tags: [Books]
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
 *             required:
 *               - featured
 *             properties:
 *               featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Featured status updated
 */
router.patch('/:id/featured', bookController.toggleFeatured);

/**
 * @swagger
 * /books/{id}/download:
 *   post:
 *     summary: Increment book download count
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download count incremented
 */
router.post('/:id/download', bookController.incrementDownload);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
router.delete('/:id', bookController.deleteBook);

module.exports = router;