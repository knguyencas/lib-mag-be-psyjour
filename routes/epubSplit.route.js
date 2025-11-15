const express = require('express');
const router = express.Router();
const epubSplitController = require('../controllers/epubSplit.controller');

//GET /api/books/:book_id/split/structure
router.get('/books/:book_id/split/structure', epubSplitController.getStructure);

// GET /api/books/:book_id/split/chapter/:chapterNum
router.get('/books/:book_id/split/chapter/:chapterNum', epubSplitController.getChapter);

module.exports = router;