import { describe, it, expect } from 'vitest';
import { DomainException, FileNotFoundError } from '@/domain/exceptions';

describe('DomainException', () => {
  it('создаёт исключение с message, code, statusCode (успех)', () => {
    const err = new DomainException('test', 'TEST_CODE', 400);

    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
    expect(err.statusCode).toBe(400);
  });
});

describe('FileNotFoundError', () => {
  it('создаёт исключение с кодом FILE_NOT_FOUND и 404 (ошибка)', () => {
    const err = new FileNotFoundError();

    expect(err.code).toBe('FILE_NOT_FOUND');
    expect(err.statusCode).toBe(404);
  });

  it('принимает кастомное сообщение', () => {
    const err = new FileNotFoundError('File with id x not found');

    expect(err.message).toBe('File with id x not found');
    expect(err.code).toBe('FILE_NOT_FOUND');
  });
});
