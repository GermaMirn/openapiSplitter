export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/openapi_splitter',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'openapi_splitter',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  filesService: {
    url: process.env.FILES_SERVICE_URL || 'http://localhost:8001',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
