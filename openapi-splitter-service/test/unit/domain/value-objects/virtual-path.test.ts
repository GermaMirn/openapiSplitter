import { describe, it, expect } from 'vitest';
import { VirtualPath } from '@/domain/value-objects';
import { DomainException } from '@/domain/exceptions';

describe('VirtualPath', () => {
  it('нормализует путь (успех)', () => {
    expect(VirtualPath.create('paths/api/users').toString()).toBe('paths/api/users');
  });

  it('нормализует слеши и убирает начальный слеш', () => {
    expect(VirtualPath.create('/paths//api/users').toString()).toBe('paths/api/users');
    expect(VirtualPath.create('paths\\api\\users').toString()).toBe('paths/api/users');
  });

  it('equals возвращает true для одинаковых путей', () => {
    const p1 = VirtualPath.create('paths/api/users');
    const p2 = VirtualPath.create('paths/api/users');
    expect(p1.equals(p2)).toBe(true);
  });

  it('getDocumentPath убирает openapi.yaml из конца', () => {
    const path = VirtualPath.create('docs/spec/openapi.yaml');
    expect(path.getDocumentPath()).toBe('docs/spec');
  });

  it('выбрасывает DomainException для пустого пути (ошибка)', () => {
    expect(() => VirtualPath.create('')).toThrow(DomainException);
  });

  it('выбрасывает DomainException для пути с .. (ошибка)', () => {
    expect(() => VirtualPath.create('paths/../secret')).toThrow(DomainException);
  });
});
