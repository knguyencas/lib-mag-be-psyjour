const Book = require('../models/Book');
const Author = require('../models/Author');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

class AdminBooksService {
  async _generateNextBookId() {
    const lastBook = await Book.findOne({})
      .sort({ book_id: -1 })
      .lean();

    if (!lastBook || !lastBook.book_id) {
      return 'BK001';
    }

    const num = parseInt(lastBook.book_id.replace('BK', ''), 10) || 0;
    const next = num + 1;
    return 'BK' + String(next).padStart(3, '0');
  }

  async _generateNextAuthorId() {
    const lastAuthor = await Author.findOne({})
      .sort({ author_id: -1 })
      .lean();

    if (!lastAuthor || !lastAuthor.author_id) {
      return 'AU001';
    }

    const num = parseInt(lastAuthor.author_id.replace('AU', ''), 10) || 0;
    const next = num + 1;
    return 'AU' + String(next).padStart(3, '0');
  }

  _uploadStreamToCloudinary(file, folder, resource_type = 'image') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async _uploadCover(file) {
    const result = await this._uploadStreamToCloudinary(file, 'psyche_library/covers', 'image');
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  }

  async _uploadEpub(file) {
    const result = await this._uploadStreamToCloudinary(file, 'psyche_library/ebooks', 'raw');
    return {
      url: result.secure_url,
      public_id: result.public_id,
      size_bytes: result.bytes,
      mime_type: file.mimetype || 'application/epub+zip',
      uploaded_at: new Date()
    };
  }

  async _resolveAuthors(author_ids_raw, new_authors_raw) {
    let existingIds = [];
    let newAuthorsInput = [];

    try {
      if (Array.isArray(author_ids_raw)) {
        existingIds = author_ids_raw;
      } else if (typeof author_ids_raw === 'string' && author_ids_raw.trim()) {
        existingIds = JSON.parse(author_ids_raw);
      }
    } catch {
      existingIds = [];
    }

    try {
      if (Array.isArray(new_authors_raw)) {
        newAuthorsInput = new_authors_raw;
      } else if (typeof new_authors_raw === 'string' && new_authors_raw.trim()) {
        newAuthorsInput = JSON.parse(new_authors_raw);
      }
    } catch {
      newAuthorsInput = [];
    }

    let existingAuthorDocs = [];
    if (existingIds.length > 0) {
      existingAuthorDocs = await Author.find({
        author_id: { $in: existingIds }
      }).lean();
    }

    const idToName = new Map();
    existingAuthorDocs.forEach(a => {
      if (a.author_id && a.name) {
        idToName.set(a.author_id, a.name);
      }
    });

    const allAuthorIds = [...existingIds];

    for (const na of newAuthorsInput) {
      const name = (na.name || '').trim();
      if (!name) continue;

      const newId = await this._generateNextAuthorId();
      const doc = new Author({
        author_id: newId,
        name,
        needs_update: true
      });

      await doc.save();
      allAuthorIds.push(newId);
      idToName.set(newId, name);
    }

    if (allAuthorIds.length === 0) {
      throw ApiError.badRequest('At least one author is required (existing or new).');
    }

    const mainAuthorId = allAuthorIds[0];
    const mainAuthorName = idToName.get(mainAuthorId) || 'Unknown author';

    return {
      mainAuthorId,
      mainAuthorName,
      allAuthorIds
    };
  }

  _parseStringOrArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return trimmed
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
    }

    return [];
  }

  async createBook(adminUserId, body, files) {
    if (!adminUserId) {
      throw ApiError.unauthorized('Admin ID not found in request');
    }

    const coverFile = files?.cover?.[0];
    const ebookFile = files?.ebook?.[0];

    if (!coverFile || !ebookFile) {
      throw ApiError.badRequest('Cover file and ebook file are required');
    }

    const {
      title,
      publisher,
      year,
      language,
      punchline,
      blurb,
      isbn,
      pageCount,
      status,
      author_ids,
      new_authors,
      categories,
      tags
    } = body;

    if (!title || !publisher || !year || !pageCount || !punchline || !blurb) {
      throw ApiError.badRequest('Missing required fields (title, publisher, year, pageCount, punchline, blurb)');
    }

    const { mainAuthorId, mainAuthorName } = await this._resolveAuthors(author_ids, new_authors);

    const categoryList = this._parseStringOrArray(categories);
    const tagList = this._parseStringOrArray(tags);

    const coverImage_cloud = await this._uploadCover(coverFile);
    const epub = await this._uploadEpub(ebookFile);
    const book_id = await this._generateNextBookId();

    const book = new Book({
      book_id,
      title: title.trim(),
      author: mainAuthorName,
      author_id: mainAuthorId,
      year: Number(year),
      publisher: publisher.trim(),
      language: language || 'en',
      categories: categoryList,
      punchline: punchline.trim(),
      blurb: blurb.trim(),
      coverImage_cloud,
      epub,
      isbn: isbn || undefined,
      pageCount: Number(pageCount),
      status: status || 'draft',
      upload_info: {
        admin_id: adminUserId.toString(),
        uploaded_at: new Date(),
        published_at: null
      },
      tags: tagList
    });

    await book.save();

    return book;
  }
}

module.exports = new AdminBooksService();
