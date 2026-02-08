import { describe, it, expect, vi } from 'vitest';
import { createRateLimiterMiddleware } from '@/presentation/middleware/rate-limiter.middleware';
import type { IRateLimitStore } from '@/application/interfaces';

describe('createRateLimiterMiddleware', () => {
  const createReq = (overrides: Partial<{ ip: string; socket: { remoteAddress: string }; headers: Record<string, string> }> = {}) =>
    ({
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      headers: {},
      ...overrides,
    }) as never;

  const createRes = () => ({
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  });

  it('при allowed: true вызывает next() и проставляет заголовки лимита', async () => {
    const store: IRateLimitStore = {
      consume: vi.fn().mockResolvedValue({
        allowed: true,
        remainingPoints: 44,
        msBeforeNext: 30_000,
        limitMax: 45,
      }),
    };
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    const middleware = createRateLimiterMiddleware(store);
    await middleware(req, res as never, next);

    expect(store.consume).toHaveBeenCalledWith('127.0.0.1');
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 45);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 44);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', 30);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('берёт ключ из X-Forwarded-For, если заголовок задан', async () => {
    const store: IRateLimitStore = {
      consume: vi.fn().mockResolvedValue({
        allowed: true,
        remainingPoints: 45,
        msBeforeNext: 0,
        limitMax: 45,
      }),
    };
    const req = createReq({ headers: { 'x-forwarded-for': ' 10.0.0.1 , 10.0.0.2' } });
    const res = createRes();
    const next = vi.fn();

    const middleware = createRateLimiterMiddleware(store);
    await middleware(req, res as never, next);

    expect(store.consume).toHaveBeenCalledWith('10.0.0.1');
  });

  it('при allowed: false возвращает 429 и Retry-After', async () => {
    const store: IRateLimitStore = {
      consume: vi.fn().mockResolvedValue({
        allowed: false,
        retryAfterMs: 12_000,
        limitMax: 45,
      }),
    };
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    const middleware = createRateLimiterMiddleware(store);
    await middleware(req, res as never, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 45);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '12');
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 12,
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('при ошибке store.consume вызывает next()', async () => {
    const store: IRateLimitStore = {
      consume: vi.fn().mockRejectedValue(new Error('redis down')),
    };
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    const middleware = createRateLimiterMiddleware(store);
    await middleware(req, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('remainingPoints 0 округляет X-RateLimit-Reset вверх (секунды)', async () => {
    const store: IRateLimitStore = {
      consume: vi.fn().mockResolvedValue({
        allowed: true,
        remainingPoints: 0,
        msBeforeNext: 1500,
        limitMax: 45,
      }),
    };
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    const middleware = createRateLimiterMiddleware(store);
    await middleware(req, res as never, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', 2);
    expect(next).toHaveBeenCalled();
  });

  it('использует unknown когда нет ip и remoteAddress (branch)', async () => {
    const store: IRateLimitStore = {
      consume: vi.fn().mockResolvedValue({
        allowed: true,
        remainingPoints: 45,
        msBeforeNext: 0,
        limitMax: 45,
      }),
    };
    const req = createReq({ ip: undefined as unknown as string, socket: { remoteAddress: undefined as unknown as string } });
    const res = createRes();
    const next = vi.fn();

    const middleware = createRateLimiterMiddleware(store);
    await middleware(req, res as never, next);

    expect(store.consume).toHaveBeenCalledWith('unknown');
  });
});
