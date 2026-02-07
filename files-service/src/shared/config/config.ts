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
  database: {
    url: getDatabaseUrl(),
  },
  storage: {
    path: resolveStoragePath(),
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  redis: {
    url: process.env.REDIS_URL || '',
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '45', 10),
    windowSec: parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '60', 10),
  },
};
