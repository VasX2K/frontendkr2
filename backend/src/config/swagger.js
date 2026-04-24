import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'RBAC Products API', version: '1.0.0', description: 'Express API: JWT, refresh tokens, RBAC, products CRUD' },
    servers: [{ url: 'http://localhost:5000' }]
  },
  apis: ['./src/routes/*.js']
});
