const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authors.controller.js');

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors with pagination and filters
 *     tags: [Authors]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *         description: Filter by nationality
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authorsController.getAllAuthors);

/**
 * @swagger
 * /authors/search:
 *   get:
 *     summary: Search authors by name or biography
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *         description: Filter by nationality
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/search', authorsController.searchAuthors);

/**
 * @swagger
 * /authors/top-by-books:
 *   get:
 *     summary: Get top authors by book count
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of authors to return
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/top-by-books', authorsController.getTopAuthorsByBookCount);

/**
 * @swagger
 * /authors/top-by-rating:
 *   get:
 *     summary: Get top authors by average book rating
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of authors to return
 *       - in: query
 *         name: minBooks
 *         schema:
 *           type: integer
 *         description: Minimum number of books required
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/top-by-rating', authorsController.getTopAuthorsByRating);

/**
 * @swagger
 * /authors/nationalities:
 *   get:
 *     summary: Get all unique nationalities
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/nationalities', authorsController.getAllNationalities);

/**
 * @swagger
 * /authors/nationality/{nationality}:
 *   get:
 *     summary: Get authors by nationality
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: nationality
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/nationality/:nationality', authorsController.getAuthorsByNationality);

/**
 * @swagger
 * /authors/{id}/stats:
 *   get:
 *     summary: Get author statistics
 *     tags: [Authors]
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
 *         description: Author not found
 */
router.get('/:id/stats', authorsController.getAuthorStats);

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get a single author by ID
 *     tags: [Authors]
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
 *         description: Author not found
 */
router.get('/:id', authorsController.getAuthorById);

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Author created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', authorsController.createAuthor);

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Update an author
 *     tags: [Authors]
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
 *         description: Author updated successfully
 *       404:
 *         description: Author not found
 */
router.put('/:id', authorsController.updateAuthor);

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *       400:
 *         description: Cannot delete author with associated books
 *       404:
 *         description: Author not found
 */
router.delete('/:id', authorsController.deleteAuthor);

module.exports = router;