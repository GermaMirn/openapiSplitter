import { describe, it, expect } from 'vitest';
import { OpenApiValidator } from '@/infrastructure/validators/openapi-validator';
import { InvalidOpenApiException } from '@/domain/exceptions';

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
});
