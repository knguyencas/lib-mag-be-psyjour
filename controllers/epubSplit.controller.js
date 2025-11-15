const Book = require('../models/Book.js');
const epubSplitService = require('../services/epubSplit.service.js');
const ApiResponse = require('../utils/apiResponse.js');
const ApiError = require('../utils/apiError.js');

class EpubSplitController {
  
  // Parse EPUB Structure and save to DB  
  async parseEpubStructure(req, res, next) {
    try {
      const { id } = req.params;
      const book = await Book.findOne({ book_id: id });

      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      if (!book.epub || !book.epub.url) {
        throw ApiError.badRequest('Book does not have EPUB file');
      }

      // Parse structure
      const structure = await epubSplitService.parseEpubStructure(
        book.epub.url,
        book.book_id
      );

      // Save to database
      book.structure = structure;
      await book.save();

      res.json(
        ApiResponse.success(
          { book_id: book.book_id, structure },
          'EPUB structure parsed successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // Get Book Structure  
  async getStructure(req, res, next) {
    try {
      const { id } = req.params;
      const book = await Book.findOne({ book_id: id });

      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      // Build navigation tree
      const navigation = this.buildNavigationTree(book);

      res.json(
        ApiResponse.success(
          {
            book_id: book.book_id,
            title: book.title,
            structure: book.structure,
            navigation
          },
          'Book structure retrieved'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // Get Chapter by Number  
  async getChapterByNumber(req, res, next) {
    try {
      const { id, chapterNum } = req.params;
      const book = await Book.findOne({ book_id: id });

      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      const chapterInfo = this.findChapterByNumber(
        book.structure,
        parseInt(chapterNum)
      );

      if (!chapterInfo) {
        throw ApiError.notFound('Chapter not found');
      }

      const epubPath = await epubSplitService.downloadEpubToTemp(
        book.epub.url,
        book.book_id
      );

      const content = await epubSplitService.getChapterContent(
        epubPath,
        chapterInfo.chapter.href
      );

      const prevChapter = this.findChapterByNumber(
        book.structure,
        parseInt(chapterNum) - 1
      );
      const nextChapter = this.findChapterByNumber(
        book.structure,
        parseInt(chapterNum) + 1
      );

      res.json(
        ApiResponse.success({
          book: {
            id: book.book_id,
            title: book.title,
            author: book.author
          },
          part: {
            number: chapterInfo.partNumber,
            title: chapterInfo.part.title
          },
          chapter: {
            number: parseInt(chapterNum),
            localNumber: chapterInfo.chapter.local_chapter_number,
            title: content.title,
            content: content.content,
            wordCount: content.wordCount
          },
          navigation: {
            hasPrev: !!prevChapter,
            hasNext: !!nextChapter,
            prevChapter: prevChapter ? parseInt(chapterNum) - 1 : null,
            nextChapter: nextChapter ? parseInt(chapterNum) + 1 : null
          }
        })
      );
    } catch (error) {
      next(error);
    }
  }

  // Get Chapter by Part & Local Number  
  async getChapterByPartAndNumber(req, res, next) {
    try {
      const { id, partNum, chapterNum } = req.params;
      const book = await Book.findOne({ book_id: id });

      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      const part = book.structure.parts.find(
        p => p.part_number === parseInt(partNum)
      );

      if (!part) {
        throw ApiError.notFound('Part not found');
      }

      const chapter = part.chapters.find(
        c => c.local_chapter_number === parseInt(chapterNum)
      );

      if (!chapter) {
        throw ApiError.notFound('Chapter not found in this part');
      }

      const epubPath = await epubSplitService.downloadEpubToTemp(
        book.epub.url,
        book.book_id
      );

      const content = await epubSplitService.getChapterContent(
        epubPath,
        chapter.href
      );

      res.json(
        ApiResponse.success({
          book: { id: book.book_id, title: book.title },
          part: { number: parseInt(partNum), title: part.title },
          chapter: {
            globalNumber: chapter.chapter_number,
            localNumber: chapter.local_chapter_number,
            title: content.title,
            content: content.content,
            wordCount: content.wordCount
          }
        })
      );
    } catch (error) {
      next(error);
    }
  }

  buildNavigationTree(book) {
    return book.structure.parts.map(part => ({
      id: `part-${part.part_number}`,
      label: part.title,
      type: 'part',
      children: part.chapters.map(chapter => ({
        id: `chapter-${chapter.chapter_number}`,
        label: chapter.title,
        type: 'chapter',
        chapterNumber: chapter.chapter_number,
        localChapterNumber: chapter.local_chapter_number,
        url: `/api/books/${book.book_id}/split/chapter/${chapter.chapter_number}`
      }))
    }));
  }
  
  findChapterByNumber(structure, chapterNumber) {
    for (const part of structure.parts) {
      for (const chapter of part.chapters) {
        if (chapter.chapter_number === chapterNumber) {
          return {
            part,
            partNumber: part.part_number,
            chapter
          };
        }
      }
    }
    return null;
  }
  
  async getChapterRange(req, res, next) {
    try {
      const { id } = req.params;
      const { from, to } = req.query;

      const fromNum = parseInt(from);
      const toNum = parseInt(to);

      // Validate
      if (isNaN(fromNum) || isNaN(toNum)) {
        throw ApiError.badRequest('Invalid range');
      }

      if (toNum - fromNum > 10) {
        throw ApiError.badRequest('Maximum 10 chapters per request');
      }

      const book = await Book.findOne({ book_id: id });
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      // Get chapters
      const chapters = [];
      for (let i = fromNum; i <= toNum; i++) {
        const info = this.findChapterByNumber(book.structure, i);
        if (info) {
          chapters.push({
            chapterNumber: i,
            title: info.chapter.title,
            partNumber: info.partNumber,
            partTitle: info.part.title
          });
        }
      }

      res.json(
        ApiResponse.success({ chapters }, 'Chapter range retrieved')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EpubSplitController();