export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  api: {
    version: process.env.API_VERSION || 'v1',
  },
  filesService: {
    url: process.env.FILES_SERVICE_URL || 'http://localhost:8001',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  redis: {
    url: process.env.REDIS_URL || '',
    maxRetriesPerRequest: parseInt(
      process.env.REDIS_MAX_RETRIES_PER_REQUEST || '5',
      10
    ),
    retryDelayMs: parseInt(process.env.REDIS_RETRY_DELAY_MS || '200', 10),
    retryMaxDelayMs: parseInt(process.env.REDIS_RETRY_MAX_DELAY_MS || '3000', 10),
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '45', 10),
    windowSec: parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '60', 10),
  },
};
