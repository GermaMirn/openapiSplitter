import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { connectDatabaseWithRetry, prisma } from '@/infrastructure/database/prisma';

const logger = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }));
vi.mock('@/shared/utils/logger', () => ({ logger }));

describe('connectDatabaseWithRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('вызывает connectWithRetry с переданным client и opts', async () => {
    const mockConnect = vi.fn().mockResolvedValue(undefined);
    const client = { $connect: mockConnect };
    const opts = { connectRetries: 2, connectRetryDelayMs: 1 };

    await connectDatabaseWithRetry(client, opts);

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Database connected');
  });

  it('при вызове без аргументов использует prisma и config.database', async () => {
    const connectSpy = vi.spyOn(prisma, '$connect').mockResolvedValue(undefined);

    await connectDatabaseWithRetry();

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Database connected');
  });

  it('при ошибке подключения ретраит и пробрасывает после исчерпания попыток', async () => {
    const mockConnect = vi.fn().mockRejectedValue(new Error('connection refused'));
    const client = { $connect: mockConnect };
    const opts = { connectRetries: 2, connectRetryDelayMs: 1 };

    await expect(connectDatabaseWithRetry(client, opts)).rejects.toThrow('connection refused');
    expect(mockConnect).toHaveBeenCalledTimes(2);
  });

  it('при throw не-Error логирует String(err) (branch connect-with-retry 27)', async () => {
    const mockConnect = vi.fn().mockRejectedValue('string error');
    const client = { $connect: mockConnect };
    const opts = { connectRetries: 1, connectRetryDelayMs: 1 };

    await expect(connectDatabaseWithRetry(client, opts)).rejects.toBe('string error');
    expect(logger.warn).toHaveBeenCalledWith(
      'Database connection attempt failed',
      expect.objectContaining({ err: 'string error' })
    );
  });
});

describe('prisma module (log config)', () => {
  const origNodeEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = origNodeEnv;
    vi.resetModules();
  });

  it('при NODE_ENV=development загружает модуль с веткой development (branch coverage)', async () => {
    process.env.NODE_ENV = 'development';
    vi.resetModules();
    await import('@/infrastructure/database/prisma');
    process.env.NODE_ENV = origNodeEnv;
  });
});
