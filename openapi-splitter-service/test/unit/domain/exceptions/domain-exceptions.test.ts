import { describe, it, expect } from 'vitest';
import {
  DomainException,
  InvalidYamlException,
  InvalidOpenApiException,
  FileNotFoundError,
  SpecificationTooLargeException,
} from '@/domain/exceptions';

describe('DomainException', () => {
  it('создаёт исключение с message, code, statusCode (успех)', () => {
    const err = new DomainException('test', 'TEST_CODE', 400);

    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
    expect(err.statusCode).toBe(400);
  });
});

describe('InvalidYamlException', () => {
  it('создаёт исключение с кодом INVALID_YAML (ошибка)', () => {
    const err = new InvalidYamlException('bad yaml');

    expect(err.code).toBe('INVALID_YAML');
    expect(err.statusCode).toBe(400);
  });
});

describe('InvalidOpenApiException', () => {
  it('создаёт исключение с кодом INVALID_OPENAPI (ошибка)', () => {
    const err = new InvalidOpenApiException('missing paths');

    expect(err.code).toBe('INVALID_OPENAPI');
    expect(err.statusCode).toBe(400);
  });
});

describe('FileNotFoundError', () => {
  it('создаёт исключение с кодом FILE_NOT_FOUND и 404 (ошибка)', () => {
    const err = new FileNotFoundError();

    expect(err.code).toBe('FILE_NOT_FOUND');
    expect(err.statusCode).toBe(404);
  });
});

describe('SpecificationTooLargeException', () => {
  it('создаёт исключение с кодом SPEC_TOO_LARGE и 413 (ошибка)', () => {
    const err = new SpecificationTooLargeException();

    expect(err.code).toBe('SPEC_TOO_LARGE');
    expect(err.statusCode).toBe(413);
  });
});
