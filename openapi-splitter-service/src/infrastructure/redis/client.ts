import Redis from 'ioredis';
import { config } from '@/shared/config/config';
import { logger } from '@/shared/utils/logger';

let client: Redis | null = null;

const {
  maxRetriesPerRequest,
  retryDelayMs,
  retryMaxDelayMs,
} = config.redis;

/** Возвращает общий клиент Redis по URL; при пустом URL или ошибке — null. Ретраи из config. */
export function getRedis(url: string): Redis | null {
  if (!url) return null;
  if (client) return client;
  try {
    client = new Redis(url, {
      maxRetriesPerRequest,
      retryStrategy(times) {
        if (times > maxRetriesPerRequest) return null;
        return Math.min(times * retryDelayMs, retryMaxDelayMs);
      },
    });
    client.on('error', (err) =>
      logger.warn('Redis connection error', { err: err.message })
    );
    return client;
  } catch (err) {
    logger.warn('Redis init failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/** Закрывает соединение с Redis (например при остановке приложения). */
export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
