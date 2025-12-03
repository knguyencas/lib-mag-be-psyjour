const express = require('express');
const router = express.Router();
const adminMetaController = require('../controllers/adminMeta.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: AdminMeta
 *   description: Metadata helpers for admin (authors, categories, tags)
 */

/**
 * @swagger
 * /api/admin/meta/authors/search:
 *   get:
 *     summary: Search authors by name (admin only)
 *     description: >
 *       Finding authors through substring, matching name or pen names.
 *       Dùng cho autocomplete trên trang admin-add-book.
 *     tags: [AdminMeta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Keywords, eg: "carl", "fyodor"
 *     responses:
 *       200:
 *         description: List authors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
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
 *     summary: Search categories by name (admin only)
 *     description: Search categories for admin-add-book autocomplete.
 *     tags: [AdminMeta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword, eg: "Decision", "Analytical"
 *     responses:
 *       200:
 *         description: List categories
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
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
 *     summary: Search tags by name (admin only)
 *     description: Search tags for admin-add-book autocomplete.
 *     tags: [AdminMeta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Tag keywords, eg: "dark", "archetypes"
 *     responses:
 *       200:
 *         description: List tags
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get(
  '/meta/tags/search',
  authMiddleware,
  authorizeRoles('admin', 'super_admin'),
  adminMetaController.searchTags
);

module.exports = router;