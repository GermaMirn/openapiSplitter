import path from 'path';

function resolveStoragePath(): string {
  const raw = process.env.STORAGE_PATH || 'storage';
  const isAbsolute = path.isAbsolute(raw);
  const segments = raw.split('/').filter(Boolean);
  if (isAbsolute && segments.length > 1) {
    return raw;
  }
  const dir = segments[0] || 'storage';
  return path.join(process.cwd(), dir);
}

function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/files_service'
  );
}

export const config = {
  port: parseInt(process.env.PORT || '8001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  api: {
    version: process.env.API_VERSION || 'v1',
  },
  database: {
    url: getDatabaseUrl(),
    connectRetries: parseInt(
      process.env.DATABASE_CONNECT_RETRIES || '5',
      10
    ),
    connectRetryDelayMs: parseInt(
      process.env.DATABASE_CONNECT_RETRY_DELAY_MS || '1000',
      10
    ),
  },
  storage: {
    path: resolveStoragePath(),
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
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
  /** Запросы с этим заголовком (и при совпадении секрета, если задан) не лимитируются (внутренние вызовы от openapi-splitter-service). */
  internalService: {
    headerName: 'x-internal-service',
    headerValue: process.env.INTERNAL_SERVICE_HEADER_VALUE || 'openapi-splitter',
    secret: process.env.INTERNAL_SERVICE_SECRET || '',
  },
};
