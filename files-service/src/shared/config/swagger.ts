import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Files Service API',
      version: '1.0.0',
      description: 'S3-подобный сервис для хранения и управления файлами. Предоставляет REST API для загрузки, получения и удаления файлов. Бюджетная альтернатива Amazon S3 для внутреннего использования.',
    },
    servers: [
      {
        url: 'http://localhost/api/files',
        description: 'Development server (through nginx)',
      },
      {
        url: `http://localhost:${config.port}`,
        description: 'Direct server access',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                },
                code: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/presentation/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
