import { describe, it, expect } from 'vitest';
import { FilePath } from '@/domain/value-objects';
import { DomainException } from '@/domain/exceptions';

describe('FilePath', () => {
  it('нормализует путь (успех)', () => {
    expect(FilePath.create('docs/api/file.yaml').toString()).toBe('docs/api/file.yaml');
  });

  it('нормализует слеши и убирает начальный слеш', () => {
    expect(FilePath.create('/docs//api/file.yaml').toString()).toBe('docs/api/file.yaml');
    expect(FilePath.create('docs\\api\\file.yaml').toString()).toBe('docs/api/file.yaml');
  });

  it('equals возвращает true для одинаковых путей', () => {
    const p1 = FilePath.create('docs/api/file.yaml');
    const p2 = FilePath.create('docs/api/file.yaml');
    expect(p1.equals(p2)).toBe(true);
  });

  it('equals возвращает false для разных путей', () => {
    const p1 = FilePath.create('docs/api/file1.yaml');
    const p2 = FilePath.create('docs/api/file2.yaml');
    expect(p1.equals(p2)).toBe(false);
  });

  it('выбрасывает DomainException для пустого пути (ошибка)', () => {
    expect(() => FilePath.create('')).toThrow(DomainException);
  });

  it('выбрасывает DomainException для пути с .. (ошибка)', () => {
    expect(() => FilePath.create('docs/../secret')).toThrow(DomainException);
    expect(() => FilePath.create('path/..')).toThrow(DomainException);
  });

  it('выбрасывает DomainException для слишком длинного пути (ошибка)', () => {
    const longPath = 'a'.repeat(2049);
    expect(() => FilePath.create(longPath)).toThrow(DomainException);
  });
});
