import { describe, it, expect, vi } from 'vitest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenApiVersion } from '@/domain/value-objects';
import { OpenApiValidator } from '@/infrastructure/validators/openapi-validator';
import { InvalidOpenApiException } from '@/domain/exceptions';

vi.mock('@apidevtools/swagger-parser', async (importOriginal) => {
  const actual = await importOriginal<{ default: { validate: (s: unknown) => Promise<unknown> } }>();
  return {
    default: {
      validate: vi.fn((s: unknown) => actual.default.validate(s)),
    },
  };
});

vi.mock('@/domain/value-objects', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domain/value-objects')>();
  return {
    ...actual,
    OpenApiVersion: {
      ...actual.OpenApiVersion,
      create: vi.fn((...args: unknown[]) => actual.OpenApiVersion.create(...(args as [string]))),
    },
  };
});

describe('OpenApiValidator', () => {
  const validator = new OpenApiValidator();

  it('валидирует корректную OpenAPI 3.0 спецификацию (успех)', async () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const result = await validator.validate(spec);

    expect(result.isValid).toBe(true);
    expect(result.version.toString()).toBe('3.0.0');
  });

  it('валидирует Swagger 2.0 (успех)', async () => {
    const spec = {
      swagger: '2.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const result = await validator.validate(spec);

    expect(result.version.toString()).toBe('2.0');
  });

  it('выбрасывает InvalidOpenApiException для null/undefined spec (ошибка)', async () => {
    await expect(validator.validate(null as never)).rejects.toThrow(InvalidOpenApiException);
  });

  it('выбрасывает InvalidOpenApiException при отсутствии openapi/swagger (ошибка)', async () => {
    const spec = { info: { title: 'Test', version: '1.0.0' }, paths: {} } as never;

    await expect(validator.validate(spec)).rejects.toThrow(InvalidOpenApiException);
  });

  it('выбрасывает InvalidOpenApiException при отсутствии paths (ошибка)', async () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    } as never;

    await expect(validator.validate(spec)).rejects.toThrow(InvalidOpenApiException);
  });

  it('выбрасывает InvalidOpenApiException при отсутствии info (ошибка)', async () => {
    const spec = {
      openapi: '3.0.0',
      paths: {},
    } as never;

    await expect(validator.validate(spec)).rejects.toThrow(InvalidOpenApiException);
  });

  it('при ошибке SwaggerParser не-Error использует String(validationError) (branch)', async () => {
    vi.mocked(SwaggerParser.validate).mockRejectedValueOnce('non-Error throw');
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const result = await validator.validate(spec);

    expect(result.version.toString()).toBe('3.0.0');
  });

  it('при throw не-Error во внешнем catch использует Unknown validation error (branch)', async () => {
    vi.mocked(OpenApiVersion.create).mockImplementationOnce(() => {
      throw 'non-Error';
    });
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    try {
      await validator.validate(spec);
      expect.fail('should throw');
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidOpenApiException);
      expect((e as Error).message).toBe('Unknown validation error');
    }
  });

  it('при throw Error во внешнем catch использует error.message (branch 68)', async () => {
    vi.mocked(OpenApiVersion.create).mockImplementationOnce(() => {
      throw new Error('custom validation error');
    });
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    try {
      await validator.validate(spec);
      expect.fail('should throw');
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidOpenApiException);
      expect((e as Error).message).toBe('custom validation error');
    }
  });
});
