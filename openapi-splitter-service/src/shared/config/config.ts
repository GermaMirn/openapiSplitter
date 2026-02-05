export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  filesService: {
    url: process.env.FILES_SERVICE_URL || 'http://localhost:8001',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
