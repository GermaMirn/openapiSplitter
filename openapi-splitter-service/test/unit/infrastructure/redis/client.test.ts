import { describe, it, expect, vi } from 'vitest';
import { getRedis, closeRedis } from '@/infrastructure/redis/client';

const storedErrorCb = vi.hoisted(() => ({ current: null as ((err: Error) => void) | null }));
const lastRedisOptions = vi.hoisted(() => ({ current: null as { retryStrategy?: (times: number) => number | null } | null }));

const fakeClient = vi.hoisted(() => ({
  on: vi.fn((event: string, cb: (err: Error) => void) => {
    if (event === 'error') storedErrorCb.current = cb;
  }),
  quit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('ioredis', () => ({
  default: vi
    .fn()
    .mockImplementationOnce(() => {
      throw 'string error';
    })
    .mockImplementationOnce(() => {
      throw new Error('connection refused');
    })
    .mockImplementation((_url: string, options: { retryStrategy?: (times: number) => number | null }) => {
      lastRedisOptions.current = options;
      return fakeClient;
    }),
}));

const logger = vi.hoisted(() => ({ warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() }));
vi.mock('@/shared/utils/logger', () => ({ logger }));

vi.mock('@/shared/config/config', () => ({
  config: {
    redis: {
      maxRetriesPerRequest: 5,
      retryDelayMs: 200,
      retryMaxDelayMs: 3000,
    },
  },
}));

describe('getRedis', () => {
  it('при пустом url возвращает null', () => {
    expect(getRedis('')).toBeNull();
  });

  it('при ошибке создания не-Error логирует String(err) и возвращает null', () => {
    expect(getRedis('redis://localhost:6379')).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith('Redis init failed', { err: 'string error' });
  });

  it('при ошибке создания клиента (Error) возвращает null', () => {
    expect(getRedis('redis://localhost:6379')).toBeNull();
  });

  it('при успешном создании возвращает клиент; closeRedis вызывает quit', async () => {
    const client = getRedis('redis://localhost:6379');
    expect(client).toBe(fakeClient);

    await closeRedis();

    expect(fakeClient.quit).toHaveBeenCalled();
  });

  it('retryStrategy: при times > maxRetriesPerRequest возвращает null, иначе задержку из config', () => {
    getRedis('redis://localhost:6379');
    const { retryStrategy } = lastRedisOptions.current!;

    expect(retryStrategy!(1)).toBe(200);
    expect(retryStrategy!(3)).toBe(600);
    expect(retryStrategy!(5)).toBe(1000);
    expect(retryStrategy!(6)).toBeNull();
  });

  it('при событии error на клиенте вызывается logger.warn', () => {
    getRedis('redis://localhost:6379');
    expect(storedErrorCb.current).toBeTruthy();
    storedErrorCb.current!(new Error('conn lost'));

    expect(logger.warn).toHaveBeenCalledWith('Redis connection error', { err: 'conn lost' });
  });
});

describe('closeRedis', () => {
  it('не падает при вызове (клиент может быть не создан)', async () => {
    await expect(closeRedis()).resolves.toBeUndefined();
  });
});
