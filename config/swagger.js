const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Psyche Journey Library API',
      version: '1.0.0',
      description:
        'API documentation for Psyche Journey backend (books, authors, auth, admin, ...)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Production server (update this later)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in format: Bearer <token>',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '..', 'routes', '*.js'),
    path.join(__dirname, '..', 'routes', '**', '*.js'),
    path.join(__dirname, '..', 'models', '*.js'),
    path.join(__dirname, '..', 'models', '**', '*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;