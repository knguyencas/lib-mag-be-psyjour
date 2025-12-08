const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PsycheJournal Library API',
      version: '1.0.0',
      description: 'REST API for book library management system',
      contact: {
        name: 'API Support',
        email: 'support@psychejournal.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://lib-mag-be-psyjour.onrender.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            book_id: { type: 'string', example: 'BK001' },
            title: { type: 'string' },
            author: { type: 'string' },
            author_id: { type: 'string' },
            year: { type: 'integer' },
            publisher: { type: 'string' },
            language: { type: 'string', enum: ['en', 'vi', 'fr', 'de', 'es'] },
            primary_genre: { type: 'string' },
            categories: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            punchline: { type: 'string' },
            blurb: { type: 'string' },
            pageCount: { type: 'integer' },
            rating: { type: 'number', format: 'float' },
            status: { 
              type: 'string', 
              enum: ['draft', 'published', 'archived'] 
            },
            featured: { type: 'boolean' },
            view_count: { type: 'integer' },
            download_count: { type: 'integer' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            statusCode: { type: 'integer' }
          }
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            statusCode: { type: 'integer' },
            errors: { type: 'array', items: { type: 'string' } }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' }
          }
        }
      }
    },
    tags: [
      { name: 'Books', description: 'Book management endpoints' },
      { name: 'Authors', description: 'Author management endpoints' },
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'AdminBooks', description: 'Admin book operations' },
      { name: 'AdminManageBooks', description: 'Admin book list management' },
      { name: 'AdminManagePosts', description: 'Admin post moderation' },
      { name: 'AdminMeta', description: 'Admin metadata helpers' },
      { name: 'AdminUser', description: 'Admin user management' },
      { name: 'UserBooks', description: 'User book interactions' },
      { name: 'Favorites', description: 'User favorites' },
      { name: 'ReadingProgress', description: 'Reading progress tracking' },
      { name: 'Visual Posts', description: 'Visual post management' },
      { name: 'Perspective Posts', description: 'Perspective post management' }
    ]
  },
  apis: [
    './routes/*.js',
    './routes/*.route.js',
    './controllers/*.js',
    './controllers/*.controller.js',
    './models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;