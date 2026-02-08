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
        url: `http://localhost:${config.port}/api/${config.api.version}/files`,
        description: 'Direct server (versioned API)',
      },
      {
        url: `http://localhost/api/${config.api.version}/files`,
        description: 'Behind proxy (versioned API)',
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
        FileDto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Уникальный идентификатор файла' },
            path: { type: 'string', description: 'Виртуальный путь к файлу' },
            originalName: { type: 'string', description: 'Исходное имя файла' },
            size: { type: 'integer', description: 'Размер в байтах' },
            mimeType: { type: 'string', nullable: true, description: 'MIME-тип' },
            createdAt: { type: 'string', format: 'date-time', description: 'Дата создания (ISO)' },
          },
        },
      },
    },
  },
  apis: ['./src/presentation/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
