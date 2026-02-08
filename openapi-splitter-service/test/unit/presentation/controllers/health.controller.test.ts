import { describe, it, expect, vi, beforeEach } from 'vitest';
import { healthRouter } from '@/presentation/controllers/health.controller';

const mockGetRedis = vi.hoisted(() => vi.fn());
const configMock = vi.hoisted(() => ({ redis: { url: 'redis://localhost:6379' as string } }));

vi.mock('@/shared/config/config', () => ({
  get config() {
    return configMock;
  },
}));
vi.mock('@/infrastructure/redis', () => ({
  getRedis: (url: string) => mockGetRedis(url),
}));

describe('health.controller', () => {
  const res = { json: vi.fn() };
  const next = vi.fn();

  function getHandler() {
    const layer = healthRouter.stack.find(
      (l) => (l as { route?: { methods?: Record<string, boolean> } }).route?.methods?.get
    );
    expect(layer).toBeDefined();
    const route = (layer as { route: { stack: Array<{ handle: (req: unknown, res: unknown, next?: () => void) => void }> } }).route;
    return route.stack[0].handle;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    configMock.redis.url = 'redis://localhost:6379';
    mockGetRedis.mockReturnValue({ ping: vi.fn().mockResolvedValue(undefined) });
  });

  it('возвращает status ok, service и redis при успешной проверке Redis', async () => {
    const handler = getHandler();
    await handler({}, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      service: 'openapi-splitter-service',
      redis: 'ok',
    });
  });

  it('возвращает redis down при отсутствии клиента Redis', async () => {
    mockGetRedis.mockReturnValue(null);
    const handler = getHandler();
    await handler({}, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      service: 'openapi-splitter-service',
      redis: 'down',
    });
  });

  it('возвращает redis down при ошибке ping', async () => {
    mockGetRedis.mockReturnValue({
      ping: vi.fn().mockRejectedValue(new Error('Connection lost')),
    });
    const handler = getHandler();
    await handler({}, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      service: 'openapi-splitter-service',
      redis: 'down',
    });
  });

  it('возвращает redis disabled при пустом redis url', async () => {
    configMock.redis.url = '';
    const handler = getHandler();
    await handler({}, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      service: 'openapi-splitter-service',
      redis: 'disabled',
    });
    expect(mockGetRedis).not.toHaveBeenCalled();
  });
});
