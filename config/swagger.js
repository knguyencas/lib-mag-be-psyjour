// swagger.config.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Psyche Journey Library API',
      version: '1.0.0',
      description: 'API documentation for Psyche Journey backend (books, authors, auth, admin, ...)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local dev server',
      },
    ],
    components: {
      securitySchemes: {
        // 👇 cái này làm cho Swagger có nút "Authorize"
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // Nếu muốn mọi endpoint mặc định yêu cầu bearerAuth, có thể bật global security:
    // security: [
    //   {
    //     bearerAuth: [],
    //   },
    // ],
  },
  // Nơi swagger-jsdoc sẽ quét JSDoc @swagger của cậu
  apis: [
    './routes/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
