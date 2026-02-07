import { describe, it, expect } from 'vitest';
import { VirtualFile } from '@/domain/entities';
import { VirtualPath } from '@/domain/value-objects';

describe('VirtualFile', () => {
  it('создаёт файл и возвращает size (успех)', () => {
    const path = VirtualPath.create('paths/health.yaml');
    const content = 'openapi: 3.0.0';
    const file = VirtualFile.create(path, content);

    expect(file.path.toString()).toBe('paths/health.yaml');
    expect(file.size).toBe(Buffer.byteLength(content, 'utf-8'));
  });

  it('создаёт корневой файл с isRoot=true (успех)', () => {
    const path = VirtualPath.create('openapi.yaml');
    const file = VirtualFile.create(path, 'content', true);

    expect(file.isRoot).toBe(true);
  });
});
