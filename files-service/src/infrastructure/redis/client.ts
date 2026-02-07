import Redis from 'ioredis';
import { logger } from '@/shared/utils/logger';

let client: Redis | null = null;

/** Возвращает общий клиент Redis по URL; при пустом URL или ошибке — null. */
export function getRedis(url: string): Redis | null {
  if (!url) return null;
  if (client) return client;
  try {
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
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
