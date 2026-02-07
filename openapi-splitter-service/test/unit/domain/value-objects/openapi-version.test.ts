import { describe, it, expect } from 'vitest';
import { OpenApiVersion } from '@/domain/value-objects';
import { DomainException } from '@/domain/exceptions';

describe('OpenApiVersion', () => {
  it('создаёт версию для OpenAPI 3.x (успех)', () => {
    expect(OpenApiVersion.create('3.0.0').toString()).toBe('3.0.0');
  });

  it('создаёт версию для Swagger 2.0 (успех)', () => {
    expect(OpenApiVersion.create('2.0').toString()).toBe('2.0');
  });

  it('убирает пробелы при создании', () => {
    expect(OpenApiVersion.create('  3.0.0  ').toString()).toBe('3.0.0');
  });

  it('equals возвращает true для одинаковых версий', () => {
    const v1 = OpenApiVersion.create('3.0.0');
    const v2 = OpenApiVersion.create('3.0.0');
    expect(v1.equals(v2)).toBe(true);
  });

  it('equals возвращает false для разных версий', () => {
    const v1 = OpenApiVersion.create('3.0.0');
    const v2 = OpenApiVersion.create('2.0');
    expect(v1.equals(v2)).toBe(false);
  });

  it('isSwagger возвращает true для 2.0', () => {
    expect(OpenApiVersion.create('2.0').isSwagger()).toBe(true);
  });

  it('isOpenApi3 возвращает true для 3.x', () => {
    expect(OpenApiVersion.create('3.0.0').isOpenApi3()).toBe(true);
  });

  it('выбрасывает DomainException для неподдерживаемой версии (ошибка)', () => {
    expect(() => OpenApiVersion.create('1.0')).toThrow(DomainException);
  });
});
