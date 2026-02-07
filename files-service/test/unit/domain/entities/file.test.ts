import { describe, it, expect } from 'vitest';
import { File } from '@/domain/entities';
import { FileId, FilePath } from '@/domain/value-objects';

describe('File', () => {
  it('create() создаёт сущность с createdAt (успех)', () => {
    const id = FileId.fromString('123e4567-e89b-12d3-a456-426614174000');
    const path = FilePath.create('docs/api.yaml');
    const before = new Date();
    const file = File.create(id, path, 'api.yaml', 100, 'application/yaml');
    const after = new Date();

    expect(file.id).toBe(id);
    expect(file.path).toBe(path);
    expect(file.originalName).toBe('api.yaml');
    expect(file.size).toBe(100);
    expect(file.mimeType).toBe('application/yaml');
    expect(file.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(file.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('create() принимает null mimeType (успех)', () => {
    const id = FileId.create();
    const path = FilePath.create('docs/file.yaml');
    const file = File.create(id, path, 'file.yaml', 0, null);

    expect(file.mimeType).toBeNull();
  });
});
