import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from '@/shared/config/config';
import { logger } from '@/shared/utils/logger';

/**
 * Prisma 7 с engine type "client" требует driver adapter для подключения к БД.
 * URL подключения — из общего конфига (единый источник правды).
 */
const adapter = new PrismaPg({ connectionString: config.database.url });

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

/**
 * Подключение к PostgreSQL с ретраями
 */
export async function connectDatabaseWithRetry(): Promise<void> {
  const { connectRetries, connectRetryDelayMs } = config.database;
  let lastError: unknown;
  for (let attempt = 1; attempt <= connectRetries; attempt++) {
    try {
      await prisma.$connect();
      logger.info('Database connected');
      return;
    } catch (err) {
      lastError = err;
      logger.warn('Database connection attempt failed', {
        attempt,
        maxRetries: connectRetries,
        err: err instanceof Error ? err.message : String(err),
      });
      if (attempt < connectRetries) {
        await new Promise((r) => setTimeout(r, connectRetryDelayMs));
      }
    }
  }
  throw lastError;
}
