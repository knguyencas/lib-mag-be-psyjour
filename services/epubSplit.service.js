const EPub = require('epub');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const AdmZip = require('adm-zip');
const cheerio = require('cheerio');

class EpubSplitService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp/epub');
    this.cacheDir = path.join(__dirname, '../cache/epub');
    fs.ensureDirSync(this.tempDir);
    fs.ensureDirSync(this.cacheDir);
  }

  // Parse EPUB Structure
  async parseEpubStructure(epubUrl, bookId) {
    try {
      // Download EPUB từ Cloudinary
      const epubPath = await this.downloadEpubToTemp(epubUrl, bookId);
      
      // Parse EPUB
      const epub = await this.openEpub(epubPath);
      
      // Phân tích TOC để tạo cấu trúc Parts & Chapters
      const structure = await this.analyzeTOC(epub);
      
      // Cache structure để dùng lại
      await this.cacheStructure(bookId, structure);
      
      return structure;
    } catch (error) {
      throw new Error(`Failed to parse EPUB structure: ${error.message}`);
    }
  }

  // Analyze Table of Contents
  async analyzeTOC(epub) {
    return new Promise((resolve, reject) => {
      epub.getToc((error, toc) => {
        if (error) return reject(error);

        let parts = [];
        let currentPart = null;
        let globalChapterNumber = 1;
        let hasPartStructure = false; 

        toc.forEach((item, index) => {
          const title = item.title.trim();
          
          if (this.isPartTitle(title)) {
            hasPartStructure = true; 
            
            if (currentPart) {
              parts.push(currentPart);
            }
            
            currentPart = {
              part_number: parts.length + 1,
              title: title,
              chapters: []
            };
          } 
          else if (this.isChapterTitle(title)) {
            if (hasPartStructure && !currentPart) {
              currentPart = {
                part_number: 1,
                title: 'Main Content',
                chapters: []
              };
            } else if (!hasPartStructure) {
            }

            const chapter = {
              chapter_number: globalChapterNumber++,
              local_chapter_number: currentPart ? currentPart.chapters.length + 1 : parts.length + 1,
              title: title,
              href: item.href
            };

            if (currentPart) {
              currentPart.chapters.push(chapter);
            } else {
              parts.push({
                part_number: parts.length + 1,
                title: chapter.title,
                chapters: [chapter]
              });
            }
          }
        });

        if (currentPart && hasPartStructure) {
          parts.push(currentPart);
        }

        resolve({
          totalParts: parts.length,
          totalChapters: globalChapterNumber - 1,
          hasPartStructure: hasPartStructure,
          parts: parts
        });
      });
    });
  }

  // Detect Part tile 
  isPartTitle(title) {
    const partPatterns = [
      /^Part\s+[IVX\d]+/i,
      /^Phần\s+\d+/i,      
      /^Book\s+[IVX\d]+/i,    
      /^Volume\s+[IVX\d]+/i,
      /^Section\s+\d+/i
    ];
    return partPatterns.some(pattern => pattern.test(title));
  }

  // Detect Chapter  
  isChapterTitle(title) {
    const chapterPatterns = [
      /^Chapter\s+[IVX\d]+/i,
      /^Chương\s+\d+/i, 
      /^Ch\.\s*\d+/i,
      /^\d+\./
    ];
    return chapterPatterns.some(pattern => pattern.test(title));
  }

  // Get Chapter Content  
  async getChapterContent(epubPath, chapterHref) {
    const epub = await this.openEpub(epubPath);
    
    return new Promise((resolve, reject) => {
      epub.getChapter(chapterHref, (error, html) => {
        if (error) return reject(error);

        // Clean HTML và extract metadata
        const cleaned = this.cleanChapterHtml(html);
        
        resolve({
          title: cleaned.title,
          content: cleaned.html,
          wordCount: cleaned.wordCount
        });
      });
    });
  }

  // Clean Chapter HTML
  cleanChapterHtml(html) {
    const $ = cheerio.load(html);
    
    // Delete scripts và styles
    $('script, style').remove();
    
    // Extract title
    let title = $('h1, h2, h3').first().text().trim();
    
    // Wrap paragraphs
    $('p').each((i, elem) => {
      $(elem).wrap('<div class="chapter-paragraph"></div>');
    });
    
    const cleanedHtml = $('body').html() || html;
    
    // Count words
    const text = $('body').text();
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    return {
      title,
      html: cleanedHtml,
      wordCount
    };
  }

  // Download EPUB to Temp  
  async downloadEpubToTemp(url, bookId) {
    const filename = `${bookId}.epub`;
    const filepath = path.join(this.tempDir, filename);
    
    // Check for cache
    if (await fs.pathExists(filepath)) {
      return filepath;
    }
    
    // Download
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath);
      
      https.get(url, (response) => {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      }).on('error', (error) => {
        fs.unlink(filepath);
        reject(error);
      });
    });
  }

  // Open EPUB File
  async openEpub(epubPath) {
    return new Promise((resolve, reject) => {
      const epub = new EPub(epubPath);
      
      epub.on('end', () => {
        resolve(epub);
      });
      
      epub.on('error', (error) => {
        reject(error);
      });
      
      epub.parse();
    });
  }

  // Cache system
  async cacheStructure(bookId, structure) {
    const cachePath = path.join(this.cacheDir, `${bookId}_structure.json`);
    await fs.writeJson(cachePath, structure);
  }

  async getCachedStructure(bookId) {
    const cachePath = path.join(this.cacheDir, `${bookId}_structure.json`);
    
    if (await fs.pathExists(cachePath)) {
      return await fs.readJson(cachePath);
    }
    
    return null;
  }

  // Cleanup functions temp
  async cleanupTemp(bookId) {
    const filepath = path.join(this.tempDir, `${bookId}.epub`);
    await fs.remove(filepath);
  }
}

module.exports = new EpubSplitService();