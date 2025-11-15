const fs = require('fs').promises;
const axios = require('axios');
const path = require('path');
const epubParser = require('./epubParser.service.js');

class EPUBSplitService {
  constructor() {
    this.cache = new Map();
  }


  async processEPUB(bookId, epubUrl) {
    try {
      console.log(`Downloading EPUB from: ${epubUrl}`);
      const response = await axios.get(epubUrl, {
        responseType: 'arraybuffer',
        timeout: 30000 
      });
      
      const epubBuffer = Buffer.from(response.data);
      
      // Parse EPUB
      console.log(`Parsing EPUB for book: ${bookId}`);
      const { structure, chapters } = await epubParser.parseEPUB(epubBuffer);
      
      // Save cache
      this.cache.set(bookId, { structure, chapters });
      
      console.log(`Successfully processed EPUB: ${bookId}`);
      return { structure, chapters };
    } catch (error) {
      console.error(`Failed to process EPUB for ${bookId}:`, error.message);
      throw new Error(`Failed to process EPUB: ${error.message}`);
    }
  }

  getStructure(bookId) {
    const data = this.cache.get(bookId);
    if (!data) throw new Error('Book not found in cache');
    return data.structure;
  }

  getChapter(bookId, chapterNum) {
    const data = this.cache.get(bookId);
    if (!data) throw new Error('Book not found in cache');
    
    const chapter = data.chapters.get(chapterNum);
    if (!chapter) throw new Error('Chapter not found');
    
    return chapter;
  }

  clearCache(bookId) {
    return this.cache.delete(bookId);
  }

  getCacheSize() {
    return this.cache.size;
  }
}

module.exports = new EPUBSplitService();