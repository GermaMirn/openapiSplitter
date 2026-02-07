import { Request, Response, NextFunction } from 'express';
import type { IRateLimitStore } from '@/application/interfaces';

/** Ключ для лимита — IP клиента */
function getClientIdentifier(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

/** Middleware rate limit: берёт ключ клиента из запроса, вызывает store (порт) и проставляет заголовки/статус. */
export function createRateLimiterMiddleware(store: IRateLimitStore) {
  return async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const key = getClientIdentifier(req);
    try {
      const result = await store.consume(key);
      res.setHeader('X-RateLimit-Limit', result.limitMax);
      if (result.allowed) {
        res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remainingPoints));
        res.setHeader('X-RateLimit-Reset', Math.ceil(result.msBeforeNext / 1000));
        next();
      } else {
        const retryAfter = Math.ceil(result.retryAfterMs / 1000);
        res.setHeader('Retry-After', String(retryAfter));
        res.setHeader('X-RateLimit-Remaining', 0);
        res.status(429).json({
          success: false,
          error: {
            message: 'Too Many Requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
          },
        });
      }
    } catch {
      next();
    }
  };
}
