import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type Redis from 'ioredis';
import {
  createRateLimitStore,
  closeRateLimitStore,
  getRejectionMessage,
} from '@/infrastructure/rate-limit/redis-rate-limit-store';

const mockGetRedis = vi.hoisted(() => vi.fn((): Redis | null => null));
const mockCloseRedis = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockLimiterConsume = vi.hoisted(() => vi.fn());

vi.mock('@/infrastructure/redis', () => ({
  getRedis: mockGetRedis,
  closeRedis: mockCloseRedis,
}));

vi.mock('rate-limiter-flexible', () => ({
  RateLimiterRedis: vi.fn().mockImplementation(() => ({ consume: mockLimiterConsume })),
}));

vi.mock('@/shared/utils/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const opts = {
  redisUrl: 'redis://localhost:6379',
  keyPrefix: 'rl:splitter',
  max: 45,
  windowSec: 60,
};

describe('createRateLimitStore', () => {
  beforeEach(() => {
    mockGetRedis.mockReturnValue(null);
    mockCloseRedis.mockClear();
    mockLimiterConsume.mockReset();
  });

  afterEach(async () => {
    await closeRateLimitStore();
  });

  it('при пустом redisUrl возвращает NoOp store: consume разрешает и отдаёт limitMax', async () => {
    const store = createRateLimitStore({
      redisUrl: '',
      keyPrefix: 'rl:splitter',
      max: 45,
      windowSec: 60,
    });

    const result = await store.consume('127.0.0.1');

    expect(result).toEqual({
      allowed: true,
      remainingPoints: 45,
      msBeforeNext: 0,
      limitMax: 45,
    });
  });

  it('при непустом redisUrl и getRedis null возвращает NoOp store', async () => {
    const store = createRateLimitStore({ ...opts });

    const result = await store.consume('any-key');

    expect(result.allowed).toBe(true);
    expect(result.limitMax).toBe(45);
    expect('remainingPoints' in result && result.remainingPoints).toBe(45);
  });

  it('при getRedis возвращает клиент: consume успех — allowed true и заголовки', async () => {
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockResolvedValue({
      remainingPoints: 2,
      msBeforeNext: 10_000,
    });

    const result = await store.consume('192.168.1.1');

    expect(result).toEqual({
      allowed: true,
      remainingPoints: 2,
      msBeforeNext: 10_000,
      limitMax: 45,
    });
  });

  it('при лимите исчерпан (remainingPoints 0): allowed false, retryAfterMs', async () => {
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockRejectedValueOnce({
      remainingPoints: 0,
      msBeforeNext: 15_000,
    });

    const result = await store.consume('key');

    expect(result).toEqual({
      allowed: false,
      retryAfterMs: 15_000,
      limitMax: 45,
    });
  });

  it('при remainingPoints 0 без msBeforeNext использует 60_000 (branch 41)', async () => {
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockRejectedValueOnce({ remainingPoints: 0 });

    const result = await store.consume('key');

    expect(result).toEqual({
      allowed: false,
      retryAfterMs: 60_000,
      limitMax: 45,
    });
  });

  it('при другой ошибке consume: логируем и возвращаем allowed true (fallback)', async () => {
    const { logger } = await import('@/shared/utils/logger');
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockRejectedValueOnce(new Error('redis down'));

    const result = await store.consume('key');

    expect(logger.warn).toHaveBeenCalledWith(
      'Rate limiter error',
      expect.objectContaining({ err: 'redis down' })
    );
    expect(result).toEqual({
      allowed: true,
      remainingPoints: 45,
      msBeforeNext: 0,
      limitMax: 45,
    });
  });

  it('при reject объект с message использует (rej as Error).message в логе (branch 41)', async () => {
    const { logger } = await import('@/shared/utils/logger');
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockRejectedValueOnce({ message: 'custom err' });

    await store.consume('key');

    expect(logger.warn).toHaveBeenCalledWith('Rate limiter error', expect.objectContaining({ err: 'custom err' }));
  });

  it('при reject не-объект без message использует String(rej) в логе', async () => {
    const { logger } = await import('@/shared/utils/logger');
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockRejectedValueOnce(42);

    const result = await store.consume('key');

    expect(logger.warn).toHaveBeenCalledWith('Rate limiter error', expect.objectContaining({ err: '42' }));
    expect(result.allowed).toBe(true);
  });

  it('при reject объект без message использует String(rej) в логе (branch)', async () => {
    const { logger } = await import('@/shared/utils/logger');
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockRejectedValueOnce({ code: 'ERR' });

    await store.consume('key');

    expect(logger.warn).toHaveBeenCalledWith('Rate limiter error', expect.objectContaining({ err: '[object Object]' }));
  });

  it('при reject null использует String(rej) в логе (branch)', async () => {
    const { logger } = await import('@/shared/utils/logger');
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockRejectedValueOnce(null);

    await store.consume('key');

    expect(logger.warn).toHaveBeenCalledWith('Rate limiter error', expect.objectContaining({ err: 'null' }));
  });

  it('при reject undefined использует String(rej) в логе (branch)', async () => {
    const { logger } = await import('@/shared/utils/logger');
    mockGetRedis.mockReturnValueOnce({} as Redis);
    const store = createRateLimitStore({ ...opts });
    mockLimiterConsume.mockRejectedValueOnce(undefined);

    await store.consume('key');

    expect(logger.warn).toHaveBeenCalledWith('Rate limiter error', expect.objectContaining({ err: 'undefined' }));
  });

  it('при ошибке создания RateLimiterRedis возвращает NoOp store', async () => {
    const { RateLimiterRedis } = await import('rate-limiter-flexible');
    mockGetRedis.mockReturnValueOnce({} as Redis);
    vi.mocked(RateLimiterRedis).mockImplementationOnce(() => {
      throw new Error('RL init failed');
    });

    const store = createRateLimitStore({ ...opts });
    const result = await store.consume('key');

    expect(result.allowed).toBe(true);
    expect(result.limitMax).toBe(45);
  });

  it('при создании RateLimiterRedis бросок не-Error логирует String(err) (branch)', async () => {
    const { logger } = await import('@/shared/utils/logger');
    const { RateLimiterRedis } = await import('rate-limiter-flexible');
    mockGetRedis.mockReturnValueOnce({} as Redis);
    vi.mocked(RateLimiterRedis).mockImplementationOnce(() => {
      throw 'string init error';
    });

    const store = createRateLimitStore({ ...opts });
    const result = await store.consume('key');

    expect(logger.warn).toHaveBeenCalledWith('Rate limiter Redis init failed', expect.objectContaining({ err: 'string init error' }));
    expect(result.allowed).toBe(true);
  });
});

describe('getRejectionMessage', () => {
  it('возвращает message когда rej — объект с message (branch)', () => {
    expect(getRejectionMessage(new Error('err'))).toBe('err');
    expect(getRejectionMessage({ message: 'custom' })).toBe('custom');
  });

  it('возвращает String(rej) когда rej не объект или без message (branch)', () => {
    expect(getRejectionMessage(null)).toBe('null');
    expect(getRejectionMessage(undefined)).toBe('undefined');
    expect(getRejectionMessage(42)).toBe('42');
    expect(getRejectionMessage({ code: 'ERR' })).toBe('[object Object]');
  });
});

describe('closeRateLimitStore', () => {
  it('вызывает closeRedis()', async () => {
    await closeRateLimitStore();
    expect(mockCloseRedis).toHaveBeenCalled();
  });
});
