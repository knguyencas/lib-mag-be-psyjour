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
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://lib-mag-be-psyjour.onrender.com',
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
      }
    },
    tags: [
      { name: 'Books', description: 'Book management endpoints' },
      { name: 'Authors', description: 'Author management endpoints' },
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'AdminBooks', description: 'Admin book operations' },
      { name: 'AdminManageBooks', description: 'Admin book list management' },
      { name: 'AdminManagePosts', description: 'Admin post moderation' },
      { name: 'AdminMeta', description: 'Admin metadata helpers (authors, categories, tags)' },
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
    './routes/*.route.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;