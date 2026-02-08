import { describe, it, expect, vi, beforeEach } from 'vitest';
import { connectWithRetry } from '@/infrastructure/database/connect-with-retry';

const logger = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }));
vi.mock('@/shared/utils/logger', () => ({ logger }));

describe('connectWithRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('успех с первой попытки — вызывает connect один раз и logger.info', async () => {
    const connect = vi.fn().mockResolvedValue(undefined);
    await connectWithRetry(connect, {
      connectRetries: 3,
      connectRetryDelayMs: 10,
    });
    expect(connect).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Database connected');
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('успех со второй попытки — вызывает connect дважды, один warn', async () => {
    const connect = vi
      .fn()
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValueOnce(undefined);
    await connectWithRetry(connect, {
      connectRetries: 3,
      connectRetryDelayMs: 5,
    });
    expect(connect).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledWith('Database connection attempt failed', {
      attempt: 1,
      maxRetries: 3,
      err: 'first fail',
    });
    expect(logger.info).toHaveBeenCalledWith('Database connected');
  });

  it('все попытки неудачны — пробрасывает последнюю ошибку', async () => {
    const err = new Error('connection refused');
    const connect = vi.fn().mockRejectedValue(err);
    await expect(
      connectWithRetry(connect, {
        connectRetries: 2,
        connectRetryDelayMs: 5,
      })
    ).rejects.toThrow('connection refused');
    expect(connect).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it('логирует attempt и maxRetries при каждой неудаче', async () => {
    const connect = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(
      connectWithRetry(connect, {
        connectRetries: 2,
        connectRetryDelayMs: 1,
      })
    ).rejects.toThrow('fail');
    expect(logger.warn).toHaveBeenCalledWith(
      'Database connection attempt failed',
      expect.objectContaining({ attempt: 1, maxRetries: 2 })
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'Database connection attempt failed',
      expect.objectContaining({ attempt: 2, maxRetries: 2 })
    );
  });
});
