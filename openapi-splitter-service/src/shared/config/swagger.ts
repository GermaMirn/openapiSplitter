import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OpenAPI Splitter Service API',
      version: '1.0.0',
      description: 'API для парсинга и разделения OpenAPI спецификаций по правилам. Принимает монолитный YAML файл и разрезает его на логические части.',
    },
    servers: [
      {
        url: `http://localhost/api/${config.api.version}/splitter`,
        description: 'Behind proxy (versioned API)',
      },
      {
        url: `http://localhost:${config.port}/api/${config.api.version}/splitter`,
        description: 'Direct server (versioned API)',
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
        TreeNode: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Уникальный ключ узла' },
            label: { type: 'string', description: 'Имя файла/папки' },
            data: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['document', 'schema', 'security', 'path', 'folder', 'file'],
                  description: 'Тип узла'
                },
                path: { type: 'string', description: 'Путь к файлу (для файлов)' },
                fileId: { type: 'string', description: 'ID файла (для файлов)' },
              },
            },
            children: {
              type: 'array',
              items: { $ref: '#/components/schemas/TreeNode' },
            },
          },
        },
        FileMetadata: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID файла' },
            path: { type: 'string', description: 'Виртуальный путь' },
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
