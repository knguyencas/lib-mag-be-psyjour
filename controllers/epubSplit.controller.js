const epubSplitService = require('../services/epubSplit.service.js');
const Book = require('../models/Book');

// GET /api/books/:book_id/split/structure
exports.getStructure = async (req, res) => {
  try {
    const { book_id } = req.params;
    
    // Finding book from DB
    const book = await Book.findOne({ book_id });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Check cache or new process
    let structure;
    try {
      structure = epubSplitService.getStructure(book_id);
    } catch {
      // If not in cache -> process
      const epubUrl = book.epub?.url;
      if (!epubUrl) {
        return res.status(400).json({ error: 'EPUB file not found' });
      }
      
      const result = await epubSplitService.processEPUB(book_id, epubUrl);
      structure = result.structure;
    }
    
    res.json({
      book_id,
      title: book.title,
      structure
    });
  } catch (error) {
    console.error('Error getting structure:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/books/:book_id/split/chapter/:chapterNum
exports.getChapter = async (req, res) => {
  try {
    const { book_id, chapterNum } = req.params;
    const num = parseInt(chapterNum);
    
    if (isNaN(num) || num < 1) {
      return res.status(400).json({ error: 'Invalid chapter number' });
    }
    
    let chapter;
    try {
      chapter = epubSplitService.getChapter(book_id, num);
    } catch {
      const book = await Book.findOne({ book_id });
      if (!book?.epub?.url) {
        return res.status(404).json({ error: 'Book or EPUB not found' });
      }
      
      await epubSplitService.processEPUB(book_id, book.epub.url);
      chapter = epubSplitService.getChapter(book_id, num);
    }
    
    res.json(chapter);
  } catch (error) {
    console.error('Error getting chapter:', error);
    res.status(500).json({ error: error.message });
  }
};