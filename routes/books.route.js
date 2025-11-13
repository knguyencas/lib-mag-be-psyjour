const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller.js');

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
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
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
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', booksController.getAllBooks);

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
router.get('/stats/overview', booksController.getBookStatistics);

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
router.get('/top-rated-by-category', booksController.getTopRatedBooksByCategory);

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
router.get('/author/:authorId', booksController.getBooksByAuthor);

/**
 * @swagger
 * /books/category/{categoryId}:
 *   get:
 *     summary: Get all books by a specific category
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/category/:categoryId', booksController.getBooksByCategory);

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
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Book not found
 */
router.get('/:id', booksController.getBookById);

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
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               isbn:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               publisher:
 *                 type: string
 *               pages:
 *                 type: number
 *               genre:
 *                 type: string
 *               description:
 *                 type: string
 *               language:
 *                 type: string
 *               price:
 *                 type: number
 *               inStock:
 *                 type: boolean
 *               rating:
 *                 type: number
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', booksController.createBook);

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
router.put('/:id', booksController.updateBook);

/**
 * @swagger
 * /books/{id}/stock:
 *   patch:
 *     summary: Update book stock status
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
 *               - inStock
 *             properties:
 *               inStock:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Stock status updated
 */
router.patch('/:id/stock', booksController.updateBookStock);

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
router.patch('/:id/rating', booksController.updateBookRating);

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
router.delete('/:id', booksController.deleteBook);

module.exports = router;