import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { IRateLimitStore, RateLimitConsumeResult } from '@/application/interfaces';
import { getRedis, closeRedis } from '@/infrastructure/redis';
import { logger } from '@/shared/utils/logger';

/** Заглушка хранилища при отсутствии Redis: всегда разрешает и отдаёт полный лимит. */
class NoOpRateLimitStore implements IRateLimitStore {
  constructor(private readonly limitMax: number) {}

  async consume(): Promise<RateLimitConsumeResult> {
    return {
      allowed: true,
      remainingPoints: this.limitMax,
      msBeforeNext: 0,
      limitMax: this.limitMax,
    };
  }
}

/** Хранилище лимитов на Redis через rate-limiter-flexible. */
class RedisRateLimitStore implements IRateLimitStore {
  constructor(
    private readonly limiter: RateLimiterRedis,
    private readonly limitMax: number
  ) {}

  async consume(key: string): Promise<RateLimitConsumeResult> {
    try {
      const res = await this.limiter.consume(key);
      return {
        allowed: true,
        remainingPoints: res.remainingPoints,
        msBeforeNext: res.msBeforeNext,
        limitMax: this.limitMax,
      };
    } catch (rej: unknown) {
      const r = rej as { remainingPoints?: number; msBeforeNext?: number };
      if (r?.remainingPoints === 0) {
        return {
          allowed: false,
          retryAfterMs: r?.msBeforeNext ?? 60_000,
          limitMax: this.limitMax,
        };
      }
      logger.warn('Rate limiter error', {
        err:
          rej && typeof rej === 'object' && 'message' in rej
            ? (rej as Error).message
            : String(rej),
      });
      return {
        allowed: true,
        remainingPoints: this.limitMax,
        msBeforeNext: 0,
        limitMax: this.limitMax,
      };
    }
  }
}

let limiterInstance: RateLimiterRedis | null = null;

export interface RateLimitStoreOptions {
  redisUrl: string;
  keyPrefix: string;
  max: number;
  windowSec: number;
}

/** Создаёт IRateLimitStore: на Redis при заданном redisUrl, иначе no-op. */
export function createRateLimitStore(options: RateLimitStoreOptions): IRateLimitStore {
  const { redisUrl, keyPrefix, max, windowSec } = options;
  if (!redisUrl) return new NoOpRateLimitStore(max);
  const redis = getRedis(redisUrl);
  if (!redis) return new NoOpRateLimitStore(max);
  try {
    if (!limiterInstance) {
      limiterInstance = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix,
        points: max,
        duration: windowSec,
      });
    }
    return new RedisRateLimitStore(limiterInstance, max);
  } catch (err) {
    logger.warn('Rate limiter Redis init failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    return new NoOpRateLimitStore(max);
  }
}

/** Закрывает Redis, используемый хранилищем лимитов (например при остановке приложения). */
export async function closeRateLimitStore(): Promise<void> {
  await closeRedis();
  limiterInstance = null;
}
