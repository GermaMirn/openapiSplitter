import { describe, it, expect, vi, afterEach } from 'vitest';
import { errorHandler, createErrorLogContext } from '@/presentation/middleware/error-handler.middleware';
import { DomainException } from '@/domain/exceptions';

describe('errorHandler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('возвращает statusCode доменного исключения (успех)', () => {
    const err = new DomainException('test error', 'TEST_CODE', 400);
    const req = { path: '/api', method: 'GET' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    errorHandler(err, req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'test error',
          code: 'TEST_CODE',
        }),
      })
    );
  });

  it('добавляет stack в ответ при NODE_ENV=development (DomainException)', () => {
    process.env.NODE_ENV = 'development';
    const err = new DomainException('test', 'CODE', 400);
    const req = { path: '/api', method: 'GET' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    errorHandler(err, req as never, res as never, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'test',
          code: 'CODE',
          stack: expect.any(String),
        }),
      })
    );
  });

  it('возвращает 500 для обычной ошибки (ошибка)', () => {
    const err = new Error('internal error');
    const req = { path: '/api', method: 'GET' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    errorHandler(err, req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      })
    );
  });

  it('добавляет stack в ответ при NODE_ENV=development (generic error)', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('internal error');
    const req = { path: '/api', method: 'GET' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    errorHandler(err, req as never, res as never, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'internal error',
          code: 'INTERNAL_ERROR',
          stack: expect.any(String),
        }),
      })
    );
  });

  it('использует Internal Server Error при пустом message', () => {
    const err = new Error('');
    const req = { path: '/api', method: 'GET' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    errorHandler(err, req as never, res as never, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Internal Server Error',
          code: 'INTERNAL_ERROR',
        }),
      })
    );
  });

  it('не добавляет stack при NODE_ENV=production', () => {
    process.env.NODE_ENV = 'production';
    const err = new DomainException('test', 'CODE', 400);
    const req = { path: '/api', method: 'GET' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    errorHandler(err, req as never, res as never, vi.fn());

    const callArg = res.json.mock.calls[0][0];
    expect(callArg.error.stack).toBeUndefined();
  });

  it('обрабатывает ошибку без stack (branch: err.stack ?? null)', () => {
    const err = { message: 'no stack', name: 'Error' } as Error;
    const req = { path: '/api', method: 'GET' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    errorHandler(err, req as never, res as never, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'no stack',
          code: 'INTERNAL_ERROR',
        }),
      })
    );
  });

  it('createErrorLogContext использует UNKNOWN при отсутствии code (branch)', () => {
    const req = { path: '/api', method: 'GET' };
    const err = new Error('test');
    const result = createErrorLogContext(req as never, err) as { code: string; path: string; method: string };

    expect(result.code).toBe('UNKNOWN');
    expect(result.path).toBe('/api');
    expect(result.method).toBe('GET');
  });
});
