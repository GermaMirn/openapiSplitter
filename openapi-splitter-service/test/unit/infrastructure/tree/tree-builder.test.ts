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
});
