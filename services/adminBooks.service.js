const Book = require('../models/Book');
const Author = require('../models/Author');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/apiError');

class AdminBooksService {
  async generateBookId() {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  async createBook(adminUserId, body, files) {
    try {
      const {
        title,
        author,
        author_id,
        publisher,
        year,
        language,
        pageCount,
        punchline,
        blurb,
        isbn,
        status = 'draft',
        categories,
        tags
      } = body;

      if (!title?.trim()) {
        throw ApiError.badRequest('Title is required');
      }

      if (!author?.trim()) {
        throw ApiError.badRequest('Author name is required');
      }

      if (!author_id?.trim()) {
        throw ApiError.badRequest('Author ID is required');
      }

      if (!publisher?.trim()) {
        throw ApiError.badRequest('Publisher is required');
      }

      if (!punchline?.trim()) {
        throw ApiError.badRequest('Punchline is required');
      }

      if (!blurb?.trim()) {
        throw ApiError.badRequest('Blurb is required');
      }

      if (!year) {
        throw ApiError.badRequest('Publication year is required');
      }

      if (!pageCount) {
        throw ApiError.badRequest('Page count is required');
      }

      if (!files.cover || !files.cover[0]) {
        throw ApiError.badRequest('Cover image is required');
      }

      if (!files.ebook || !files.ebook[0]) {
        throw ApiError.badRequest('EPUB file is required');
      }

      let categoryNames = [];
      if (categories) {
        const catList = JSON.parse(categories);
        for (const catName of catList) {
          if (!catName?.trim()) continue;
          
          let cat = await Category.findOne({ name: catName.trim() });
          
          if (!cat) {
            cat = await Category.create({
              name: catName.trim(),
              isActive: true,
              needs_update: true
            });
          }
          
          categoryNames.push(cat.name);
        }
      }

      let tagNames = [];
      if (tags) {
        const tagList = JSON.parse(tags);
        tagNames = tagList.map(t => t.toLowerCase().trim()).filter(Boolean);
      }

      console.log('Uploading cover to Cloudinary...');
      const coverFile = files.cover[0];
      const coverResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'book-covers',
            resource_type: 'image',
            transformation: [
              { width: 800, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(coverFile.buffer);
      });

      console.log('Cover uploaded:', coverResult.secure_url);

      console.log('Uploading EPUB to Cloudinary...');
      const ebookFile = files.ebook[0];
      const ebookResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ebooks',
            resource_type: 'raw'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(ebookFile.buffer);
      });

      console.log('EPUB uploaded:', ebookResult.secure_url);

      const book_id = await this.generateBookId();
      console.log('Generated book_id:', book_id);

      const bookData = {
        book_id,
        title: title.trim(),
        author: author.trim(),
        author_id: author_id.trim(),
        publisher: publisher.trim(),
        year: parseInt(year, 10),
        language: language || 'en',
        pageCount: parseInt(pageCount, 10),
        punchline: punchline.trim(),
        blurb: blurb.trim(),
        isbn: isbn?.trim() || undefined,
        categories: categoryNames,
        tags: tagNames,
        status: status,
        
        coverImage_cloud: {
          url: coverResult.secure_url,
          public_id: coverResult.public_id,
          width: coverResult.width,
          height: coverResult.height,
          format: coverResult.format
        },
        
        epub: {
          url: ebookResult.secure_url,
          public_id: ebookResult.public_id,
          size_bytes: ebookResult.bytes,
          mime_type: 'application/epub+zip',
          uploaded_at: new Date()
        },
        
        upload_info: {
          admin_id: adminUserId,
          uploaded_at: new Date(),
          published_at: status === 'published' ? new Date() : undefined
        }
      };

      console.log('Creating book in database...');
      const book = await Book.create(bookData);

      console.log('Book created successfully:', book.book_id);

      return {
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        status: book.status,
        primary_genre: book.primary_genre,
        cover_url: book.coverImage_cloud.url,
        epub_url: book.epub.url
      };
    } catch (error) {
      console.error('Error in createBook service:', error);
      
      if (error.coverPublicId) {
        try {
          await cloudinary.uploader.destroy(error.coverPublicId);
        } catch (cleanupErr) {
          console.error('Failed to cleanup cover:', cleanupErr);
        }
      }
      
      if (error.ebookPublicId) {
        try {
          await cloudinary.uploader.destroy(error.ebookPublicId, { resource_type: 'raw' });
        } catch (cleanupErr) {
          console.error('Failed to cleanup ebook:', cleanupErr);
        }
      }
      
      throw error;
    }
  }
}

module.exports = new AdminBooksService();