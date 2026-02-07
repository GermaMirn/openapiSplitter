export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  filesService: {
    url: process.env.FILES_SERVICE_URL || 'http://localhost:8001',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  redis: {
    url: process.env.REDIS_URL || '',
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '45', 10),
    windowSec: parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '60', 10),
  },
};
