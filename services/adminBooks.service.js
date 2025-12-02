const Book = require('../models/Book');
const Author = require('../models/Author');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/apiError');

class AdminBooksService {
  /**
   * Generate unique book_id
   */
  async generateBookId() {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Create a new book with cover + ebook upload
   */
  async createBook(adminUserId, body, files) {
    try {
      // ========== 1) PARSE INPUT ==========
      const {
        title,
        author,        // Single author name from frontend
        author_id,     // Single author_id from frontend
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

      // ========== 2) VALIDATE REQUIRED FIELDS ==========
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

      // Validate files
      if (!files.cover || !files.cover[0]) {
        throw ApiError.badRequest('Cover image is required');
      }

      if (!files.ebook || !files.ebook[0]) {
        throw ApiError.badRequest('EPUB file is required');
      }

      // ========== 3) HANDLE CATEGORIES ==========
      let categoryNames = [];
      if (categories) {
        const catList = JSON.parse(categories);
        for (const catName of catList) {
          if (!catName?.trim()) continue;
          
          // Check if category exists
          let cat = await Category.findOne({ name: catName.trim() });
          
          if (!cat) {
            // Create new category with needs_update flag
            cat = await Category.create({
              name: catName.trim(),
              isActive: true,
              needs_update: true
            });
          }
          
          categoryNames.push(cat.name);
        }
      }

      // ========== 4) HANDLE TAGS ==========
      let tagNames = [];
      if (tags) {
        const tagList = JSON.parse(tags);
        tagNames = tagList.map(t => t.toLowerCase().trim()).filter(Boolean);
      }

      // ========== 5) UPLOAD COVER TO CLOUDINARY ==========
      console.log('📤 Uploading cover to Cloudinary...');
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

      console.log('✅ Cover uploaded:', coverResult.secure_url);

      // ========== 6) UPLOAD EBOOK TO CLOUDINARY ==========
      console.log('📤 Uploading EPUB to Cloudinary...');
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

      console.log('✅ EPUB uploaded:', ebookResult.secure_url);

      // ========== 7) GENERATE BOOK ID ==========
      const book_id = await this.generateBookId();
      console.log('📚 Generated book_id:', book_id);

      // ========== 8) CREATE BOOK ==========
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
        
        // Cloudinary cover image object
        coverImage_cloud: {
          url: coverResult.secure_url,
          public_id: coverResult.public_id,
          width: coverResult.width,
          height: coverResult.height,
          format: coverResult.format
        },
        
        // Cloudinary EPUB object
        epub: {
          url: ebookResult.secure_url,
          public_id: ebookResult.public_id,
          size_bytes: ebookResult.bytes,
          mime_type: 'application/epub+zip',
          uploaded_at: new Date()
        },
        
        // Upload info
        upload_info: {
          admin_id: adminUserId,
          uploaded_at: new Date(),
          published_at: status === 'published' ? new Date() : undefined
        }
      };

      console.log('💾 Creating book in database...');
      const book = await Book.create(bookData);

      console.log('✅ Book created successfully:', book.book_id);

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
      console.error('❌ Error in createBook service:', error);
      
      // Clean up uploaded files on error
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

  /**
   * Get all books for management with pagination, filters, search
   */
  async getManageBooks(queryParams) {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { book_id: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Book.countDocuments(filter);

    return {
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single book by book_id
   */
  async getBookById(bookId) {
    const book = await Book.findOne({ book_id: bookId });
    
    if (!book) {
      throw ApiError.notFound('Book not found');
    }
    
    return book;
  }

  async updateBook(bookId, body, files) {
    try {
      const book = await Book.findOne({ book_id: bookId });
      
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      if (body.title) book.title = body.title.trim();
      if (body.author) book.author = body.author.trim();
      if (body.author_id) book.author_id = body.author_id.trim();
      if (body.publisher) book.publisher = body.publisher.trim();
      if (body.year) book.year = parseInt(body.year, 10);
      if (body.language) book.language = body.language;
      if (body.pageCount) book.pageCount = parseInt(body.pageCount, 10);
      if (body.punchline) book.punchline = body.punchline.trim();
      if (body.blurb) book.blurb = body.blurb.trim();
      if (body.isbn !== undefined) book.isbn = body.isbn.trim() || undefined;
      if (body.status) book.status = body.status;

      if (body.categories) {
        const catList = JSON.parse(body.categories);
        const categoryNames = [];
        
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
        
        book.categories = categoryNames;
      }

      if (body.tags) {
        const tagList = JSON.parse(body.tags);
        book.tags = tagList.map(t => t.toLowerCase().trim()).filter(Boolean);
      }

      if (files.cover && files.cover[0]) {
        console.log('📤 Uploading new cover...');
        
        if (book.coverImage_cloud?.public_id) {
          try {
            await cloudinary.uploader.destroy(book.coverImage_cloud.public_id);
          } catch (err) {
            console.error('Failed to delete old cover:', err);
          }
        }
        
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
        
        book.coverImage_cloud = {
          url: coverResult.secure_url,
          public_id: coverResult.public_id,
          width: coverResult.width,
          height: coverResult.height,
          format: coverResult.format
        };
        
        console.log('New cover uploaded');
      }

      if (files.ebook && files.ebook[0]) {
        console.log('Uploading new EPUB...');
        
        if (book.epub?.public_id) {
          try {
            await cloudinary.uploader.destroy(book.epub.public_id, { resource_type: 'raw' });
          } catch (err) {
            console.error('Failed to delete old ebook:', err);
          }
        }
        
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
        
        book.epub = {
          url: ebookResult.secure_url,
          public_id: ebookResult.public_id,
          size_bytes: ebookResult.bytes,
          mime_type: 'application/epub+zip',
          uploaded_at: new Date()
        };
        
        console.log('New EPUB uploaded');
      }

      if (body.status === 'published' && !book.upload_info.published_at) {
        book.upload_info.published_at = new Date();
      }

      await book.save();

      console.log('Book updated successfully:', book.book_id);

      return {
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        status: book.status
      };
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  async deleteBook(bookId) {
    try {
      const book = await Book.findOne({ book_id: bookId });
      
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      if (book.coverImage_cloud?.public_id) {
        try {
          await cloudinary.uploader.destroy(book.coverImage_cloud.public_id);
          console.log('Deleted cover from Cloudinary');
        } catch (err) {
          console.error('Failed to delete cover:', err);
        }
      }

      if (book.epub?.public_id) {
        try {
          await cloudinary.uploader.destroy(book.epub.public_id, { resource_type: 'raw' });
          console.log('Deleted ebook from Cloudinary');
        } catch (err) {
          console.error('Failed to delete ebook:', err);
        }
      }

      await Book.deleteOne({ book_id: bookId });

      console.log('Book deleted successfully:', bookId);

      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }
}

module.exports = new AdminBooksService();