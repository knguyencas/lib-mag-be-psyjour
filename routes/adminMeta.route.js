const express = require('express');
const router = express.Router();
const adminMetaController = require('../controllers/adminMeta.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: AdminMeta
 *   description: Admin metadata helpers for authors, categories, and tags autocomplete
 */

/**
 * @swagger
 * /api/admin/meta/authors/search:
 *   get:
 *     summary: Search authors by name for autocomplete
 *     description: |
 *       Search authors using substring matching on name field.
 *       Used for autocomplete on admin-add-book page.
 *       Returns max 10 results sorted alphabetically.
 *     tags: [AdminMeta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword (e.g., "carl", "fyodor", "jung")
 *         example: carl
 *     responses:
 *       200:
 *         description: List of matching authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Author search results
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       author_id:
 *                         type: string
 *                         example: AU001
 *                       name:
 *                         type: string
 *                         example: Carl Jung
 *                       nationality:
 *                         type: string
 *                         example: Swiss
 *                       needs_update:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Missing search query
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin role required
 */
router.get(
  '/meta/authors/search',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  adminMetaController.searchAuthors
);

/**
 * @swagger
 * /api/admin/meta/categories/search:
 *   get:
 *     summary: Search categories by name for autocomplete
 *     description: |
 *       Search categories using substring matching.
 *       Used for autocomplete on admin-add-book page.
 *       Returns max 10 results sorted alphabetically.
 *     tags: [AdminMeta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword (e.g., "Decision", "Analytical", "Self")
 *         example: Decision
 *     responses:
 *       200:
 *         description: List of matching categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Category search results
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id:
 *                         type: string
 *                         example: CAT001
 *                       name:
 *                         type: string
 *                         example: Decision Making
 *                       primary_genre:
 *                         type: string
 *                         example: Psychology
 *                       needs_update:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Missing search query
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 */
router.get(
  '/meta/categories/search',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  adminMetaController.searchCategories
);

/**
 * @swagger
 * /api/admin/meta/tags/search:
 *   get:
 *     summary: Search tags by name for autocomplete
 *     description: |
 *       Search tags using substring matching.
 *       Used for autocomplete on admin-add-book page.
 *       Returns max 10 results sorted alphabetically.
 *     tags: [AdminMeta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword (e.g., "dark", "archetypes", "mindfulness")
 *         example: dark
 *     responses:
 *       200:
 *         description: List of matching tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tag search results
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tag_id:
 *                         type: string
 *                         example: TAG001
 *                       name:
 *                         type: string
 *                         example: dark psychology
 *                       primary_genre:
 *                         type: string
 *                         example: Psychology
 *                       needs_update:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Missing search query
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 */
router.get(
  '/meta/tags/search',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  adminMetaController.searchTags
);

module.exports = router;