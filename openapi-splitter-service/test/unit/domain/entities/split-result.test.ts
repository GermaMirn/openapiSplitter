import { describe, it, expect } from 'vitest';
import { SplitResult, VirtualFile } from '@/domain/entities';
import { VirtualPath, OpenApiVersion } from '@/domain/value-objects';

describe('SplitResult', () => {
  it('создаёт результат и возвращает корневой файл (успех)', () => {
    const basePath = VirtualPath.create('docs/spec');
    const version = OpenApiVersion.create('3.0.0');
    const root = VirtualFile.create(
      VirtualPath.create('docs/spec/openapi.yaml'),
      'content',
      true
    );
    const result = SplitResult.create(basePath, version, [root]);

    expect(result.getRootFile()).toBe(root);
  });

  it('getFileByPath возвращает файл по пути', () => {
    const basePath = VirtualPath.create('docs/spec');
    const version = OpenApiVersion.create('3.0.0');
    const filePath = VirtualPath.create('docs/spec/paths/health.yaml');
    const file = VirtualFile.create(filePath, 'content', false);
    const result = SplitResult.create(basePath, version, [file]);

    expect(result.getFileByPath(filePath)).toBe(file);
  });

  it('toFilesMap возвращает словарь путь -> содержимое', () => {
    const basePath = VirtualPath.create('docs/spec');
    const version = OpenApiVersion.create('3.0.0');
    const f1 = VirtualFile.create(VirtualPath.create('docs/spec/openapi.yaml'), 'root', true);
    const f2 = VirtualFile.create(VirtualPath.create('docs/spec/paths/health.yaml'), 'path', false);
    const result = SplitResult.create(basePath, version, [f1, f2]);

    const map = result.toFilesMap();
    expect(map['docs/spec/openapi.yaml']).toBe('root');
    expect(map['docs/spec/paths/health.yaml']).toBe('path');
  });

  it('возвращает undefined для getRootFile если нет корневого (ошибка)', () => {
    const basePath = VirtualPath.create('docs/spec');
    const version = OpenApiVersion.create('3.0.0');
    const file = VirtualFile.create(
      VirtualPath.create('docs/spec/paths/health.yaml'),
      'content',
      false
    );
    const result = SplitResult.create(basePath, version, [file]);

    expect(result.getRootFile()).toBeUndefined();
  });
});
