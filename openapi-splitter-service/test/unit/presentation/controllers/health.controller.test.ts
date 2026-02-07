import { describe, it, expect, vi } from 'vitest';
import { healthRouter } from '@/presentation/controllers/health.controller';

describe('health.controller', () => {
  it('handler возвращает status ok и service name (успех)', () => {
    const res = { json: vi.fn() };
    const next = vi.fn();

    const layer = healthRouter.stack.find(
      (l) => (l as { route?: { methods?: Record<string, boolean> } }).route?.methods?.get
    );
    expect(layer).toBeDefined();
    const route = (layer as { route: { stack: Array<{ handle: (req: unknown, res: unknown, next?: () => void) => void }> } }).route;
    const handler = route.stack[0].handle;

    handler({}, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      service: 'openapi-splitter-service',
    });
  });
});
