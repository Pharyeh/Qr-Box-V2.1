const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QR Box API Documentation',
      version: '2.1.0',
      description: 'API documentation for QR Box trading system',
      contact: {
        name: 'ReflexBox Systems'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
  },
  apis: [
    './routes/api/*.js',
    './app.js'
  ],
};

const specs = swaggerJsdoc(options);
module.exports = specs; 