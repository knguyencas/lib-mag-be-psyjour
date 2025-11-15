const express = require('express');
const router = express.Router();
const epubSplitController = require('../controllers/epubSplit.controller.js');

/**
 * @swagger
 * /books/{id}/split/parse:
 *   post:
 *     summary: Parse EPUB structure (Admin only)
 *     description: Phân tích cấu trúc EPUB và lưu vào database. Chỉ chạy 1 lần khi upload sách.
 *     tags: [EPUB Split]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Structure parsed successfully
 *       404:
 *         description: Book not found
 */
router.post('/:id/split/parse', epubSplitController.parseEpubStructure);

/**
 * @swagger
 * /books/{id}/split/structure:
 *   get:
 *     summary: Get book structure and navigation
 *     description: Lấy cấu trúc phân chia của sách (parts, chapters) để hiển thị menu
 *     tags: [EPUB Split]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 structure:
 *                   type: object
 *                   properties:
 *                     totalParts:
 *                       type: integer
 *                     totalChapters:
 *                       type: integer
 *                     parts:
 *                       type: array
 */
router.get('/:id/split/structure', epubSplitController.getStructure);

/**
 * @swagger
 * /books/{id}/split/chapter/{chapterNum}:
 *   get:
 *     summary: Get chapter content by global chapter number
 *     description: Lấy nội dung chapter theo số thứ tự toàn cục (1, 2, 3...)
 *     tags: [EPUB Split]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chapterNum
 *         required: true
 *         schema:
 *           type: integer
 *         description: Global chapter number (1-based)
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Chapter not found
 */
router.get('/:id/split/chapter/:chapterNum', epubSplitController.getChapterByNumber);


/**
 * @swagger
 * /books/{id}/split/part/{partNum}/chapter/{chapterNum}:
 *   get:
 *     summary: Get chapter by part and local chapter number
 *     description: Lấy chapter theo part và số thứ tự trong part đó
 *     tags: [EPUB Split]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: partNum
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: chapterNum
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  '/:id/split/part/:partNum/chapter/:chapterNum',
  epubSplitController.getChapterByPartAndNumber
);

/**
 * @swagger
 * /books/{id}/split/chapters:
 *   get:
 *     summary: Get multiple chapters (range)
 *     description: Lấy nhiều chapters cùng lúc (tối đa 10 chapters)
 *     tags: [EPUB Split]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: integer
 *         description: Starting chapter number
 *       - in: query
 *         name: to
 *         schema:
 *           type: integer
 *         description: Ending chapter number (max 10 chapters)
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid range
 */
router.get('/:id/split/chapters', epubSplitController.getChapterRange);

module.exports = router;