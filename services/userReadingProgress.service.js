const ReadingProgress = require('../models/ReadingProgress');
const ApiError = require('../utils/apiError');

class UserReadingProgressService {
  async generateProgressId() {
    const prefix = 'RP';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  async updateProgress(userId, bookId, progressData) {
    const { chapter_index, scroll_position, progress_percentage } = progressData;

    let progress = await ReadingProgress.findOne({
      user_id: userId,
      book_id: bookId
    });

    if (progress) {
      progress.chapter_index = chapter_index ?? progress.chapter_index;
      progress.scroll_position = scroll_position ?? progress.scroll_position;
      progress.progress_percentage = progress_percentage ?? progress.progress_percentage;
      progress.last_read_at = new Date();
      
      await progress.save();
      console.log(`Updated progress for book ${bookId}: ${progress_percentage}%`);
    } else {
      const progress_id = await this.generateProgressId();
      
      progress = await ReadingProgress.create({
        progress_id,
        user_id: userId,
        book_id: bookId,
        chapter_index: chapter_index || 0,
        scroll_position: scroll_position || 0,
        progress_percentage: progress_percentage || 0
      });
      
      console.log(`Created progress for book ${bookId}`);
    }

    return progress;
  }

  async getProgress(userId, bookId) {
    const progress = await ReadingProgress.findOne({
      user_id: userId,
      book_id: bookId
    });

    if (!progress) {
      return {
        chapter_index: 0,
        scroll_position: 0,
        progress_percentage: 0,
        last_read_at: null
      };
    }

    return progress;
  }

  async getRecentlyRead(userId, { limit = 10 }) {
    const progresses = await ReadingProgress.find({ user_id: userId })
      .sort({ last_read_at: -1 })
      .limit(limit);

    const bookIds = progresses.map(p => p.book_id);
    
    const Book = require('../models/Book');
    const books = await Book.find({ book_id: { $in: bookIds } })
      .populate('author_id', 'name')
      .populate('categories', 'name');

    const recentlyRead = progresses.map(progress => {
      const book = books.find(b => b.book_id === progress.book_id);
      return {
        book: book || null,
        progress: {
          chapter_index: progress.chapter_index,
          progress_percentage: progress.progress_percentage,
          last_read_at: progress.last_read_at
        }
      };
    }).filter(item => item.book !== null);

    return recentlyRead;
  }

  async deleteProgress(userId, bookId) {
    await ReadingProgress.deleteOne({
      user_id: userId,
      book_id: bookId
    });
    
    console.log(`Deleted progress for book ${bookId}`);
  }
}

module.exports = new UserReadingProgressService();