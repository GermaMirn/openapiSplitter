import { describe, it, expect } from 'vitest';
import { TreeBuilder } from '@/infrastructure/tree/tree-builder';

describe('TreeBuilder', () => {
  const builder = new TreeBuilder();

  it('возвращает пустой массив для пустого списка (успех)', () => {
    expect(builder.buildTree([])).toEqual([]);
  });

  it('строит дерево для одного документа (успех)', () => {
    const files = [
      { id: 'f1', path: 'docs/spec/openapi.yaml' },
      { id: 'f2', path: 'docs/spec/paths/health.yaml' },
    ];
    const roots = builder.buildTree(files);

    expect(roots).toHaveLength(1);
    expect(roots[0].data?.type).toBe('document');
    expect(roots[0].children?.length).toBeGreaterThan(0);
  });

  it('использует originalFileName как label при одном документе (успех)', () => {
    const files = [{ id: 'f1', path: 'docs/spec/openapi.yaml' }];
    const roots = builder.buildTree(files, 'my-api.yaml');

    expect(roots[0].label).toBe('my-api.yaml');
  });

  it('getRelativePath возвращает fullPath если не начинается с basePrefix (branch)', () => {
    const files = [
      { id: 'f1', path: 'docs/openapi.yaml' },
      { id: 'f2', path: 'docs' },
    ];
    const roots = builder.buildTree(files);
    expect(roots.length).toBeGreaterThanOrEqual(1);
  });

  it('detectFileType возвращает file для пути не из components/paths (branch)', () => {
    const files = [
      { id: 'f1', path: 'docs/spec/openapi.yaml' },
      { id: 'f2', path: 'docs/spec/other/custom.txt' },
    ];
    const roots = builder.buildTree(files);
    const rootWithFile = roots.find((r) => r.children?.some((c) => c.data?.type === 'file'));
    expect(rootWithFile?.children?.find((c) => c.data?.type === 'file')?.data?.type).toBe('file');
  });

  it('extractDocumentPath при одном сегменте использует parts[0] (branch)', () => {
    const files = [{ id: 'f1', path: 'openapi.yaml' }];
    const roots = builder.buildTree(files);
    expect(roots).toHaveLength(1);
    expect(roots[0].label).toBe('openapi.yaml');
  });

  it('documentName fallback на document при пустом documentPath (branch)', () => {
    const files = [{ id: 'f1', path: '' }];
    const roots = builder.buildTree(files);
    expect(roots).toHaveLength(1);
    expect(roots[0].label).toBe('document');
  });

  it('detectFileType возвращает schema и security для components (branch)', () => {
    const files = [
      { id: 'f1', path: 'docs/spec/openapi.yaml' },
      { id: 'f2', path: 'docs/spec/components/schemas/User.yaml' },
      { id: 'f3', path: 'docs/spec/components/securitySchemes/ApiKey.yaml' },
    ];
    const roots = builder.buildTree(files);
    const flatten = (nodes: typeof roots): typeof roots =>
      nodes.flatMap((n) => [n, ...flatten(n.children ?? [])]);
    const all = flatten(roots);
    expect(all.some((n) => n.data?.type === 'schema')).toBe(true);
    expect(all.some((n) => n.data?.type === 'security')).toBe(true);
  });

  it('buildDocumentTree с пустым массивом файлов возвращает null (branch 83)', () => {
    const result = (builder as unknown as { buildDocumentTree(path: string, files: { id: string; path: string }[], name?: string): unknown }).buildDocumentTree('docs/spec', []);
    expect(result).toBeNull();
  });
});
