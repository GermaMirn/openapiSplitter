import { describe, it, expect } from 'vitest';
import { FileId } from '@/domain/value-objects';
import { DomainException } from '@/domain/exceptions';

describe('FileId', () => {
  it('create() возвращает новый UUID (успех)', () => {
    const id1 = FileId.create();
    const id2 = FileId.create();
    expect(id1.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(id2.toString()).not.toBe(id1.toString());
  });

  it('fromString() принимает валидный UUID (успех)', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const id = FileId.fromString(uuid);
    expect(id.toString()).toBe(uuid);
  });

  it('equals() возвращает true для одинаковых id (успех)', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const id1 = FileId.fromString(uuid);
    const id2 = FileId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('equals() возвращает false для разных id (успех)', () => {
    const id1 = FileId.fromString('123e4567-e89b-12d3-a456-426614174000');
    const id2 = FileId.fromString('123e4567-e89b-12d3-a456-426614174001');
    expect(id1.equals(id2)).toBe(false);
  });

  it('fromString() выбрасывает DomainException для невалидного UUID (ошибка)', () => {
    expect(() => FileId.fromString('invalid-uuid')).toThrow(DomainException);
    expect(() => FileId.fromString('123')).toThrow(DomainException);
  });

  it('fromString() выбрасывает DomainException для пустой строки (ошибка)', () => {
    expect(() => FileId.fromString('')).toThrow(DomainException);
  });
});
