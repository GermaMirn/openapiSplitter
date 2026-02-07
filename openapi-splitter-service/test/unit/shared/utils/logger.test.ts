import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/shared/utils/logger';

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  it('info вызывает console.log (успех)', () => {
    logger.info('test message');

    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/^\[INFO\] .* - test message$/)
    );
  });

  it('error вызывает console.error (успех)', () => {
    logger.error('error message');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/^\[ERROR\] .* - error message$/)
    );
  });

  it('warn вызывает console.warn (успех)', () => {
    logger.warn('warn message');

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringMatching(/^\[WARN\] .* - warn message$/)
    );
  });

  it('debug вызывает console.debug при NODE_ENV=development (успех)', () => {
    process.env.NODE_ENV = 'development';
    logger.debug('debug message');

    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/^\[DEBUG\] .* - debug message$/)
    );
  });

  it('debug не вызывает console.debug при NODE_ENV=production (успех)', () => {
    process.env.NODE_ENV = 'production';
    logger.debug('debug message');

    expect(console.debug).not.toHaveBeenCalled();
  });

  it('передаёт доп. аргументы в info (успех)', () => {
    logger.info('msg', { path: '/api', code: 'TEST' });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/^\[INFO\] .* - msg$/),
      { path: '/api', code: 'TEST' }
    );
  });
});
