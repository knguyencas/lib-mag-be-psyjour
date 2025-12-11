const swaggerJsdoc = require('swagger-jsdoc');
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.RENDER === 'true' ||
                     !process.env.NODE_ENV;

const servers = isProduction ? [
  // Production first
  {
    url: 'https://lib-mag-be-psyjour.onrender.com',
    description: 'Production Server (Render)'
  },
  {
    url: 'http://localhost:3000',
    description: 'Local Development Server'
  }
] : [
  // Localhost first
  {
    url: 'http://localhost:3000',
    description: 'Local Development Server'
  },
  {
    url: 'https://lib-mag-be-psyjour.onrender.com',
    description: 'Production Server (Render)'
  }
];

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
    servers: servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token (without "Bearer " prefix)'
        }
      },
      schemas: {
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Books', description: 'Public book endpoints' },
      { name: 'Authors', description: 'Author information' },
      { name: 'AdminBooks', description: 'Admin: Create/update books' },
      { name: 'AdminManageBooks', description: 'Admin: Manage book list' },
      { name: 'AdminManagePosts', description: 'Admin: Moderate posts' },
      { name: 'AdminMeta', description: 'Admin: Search authors/categories/tags' },
      { name: 'AdminUser', description: 'Admin: User management' },
      { name: 'UserBooks', description: 'User: Ratings & comments' },
      { name: 'Favorites', description: 'User favorites' },
      { name: 'ReadingProgress', description: 'Reading progress tracking' },
      { name: 'Visual Posts', description: 'Visual posts management' },
      { name: 'Perspective Posts', description: 'Perspective posts management' }
    ]
  },
  apis: [
    './routes/*.js',
    './routes/*.route.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

console.log('Swagger UI default server:', servers[0].url);

module.exports = swaggerSpec;