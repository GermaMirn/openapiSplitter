import { describe, it, expect } from 'vitest';
import { filterTreeByQuery } from '@/shared/ui/FileTree/lib/filter-tree-by-query';
import type { TreeNode } from '@/shared/types';

const tree: TreeNode[] = [
  {
    key: 'doc1',
    label: 'openapi-spec',
    data: { type: 'document' },
    children: [
      {
        key: 'doc1-schemas',
        label: 'schemas',
        data: { type: 'folder' },
        children: [
          { key: 'doc1-user', label: 'user.yaml', data: { type: 'file' } },
          { key: 'doc1-order', label: 'order.yaml', data: { type: 'file' } },
        ],
      },
    ],
  },
  {
    key: 'doc2',
    label: 'another-api',
    data: { type: 'document' },
    children: [{ key: 'doc2-auth', label: 'auth.yaml', data: { type: 'file' } }],
  },
];

describe('filterTreeByQuery', () => {
  it('возвращает всё дерево при пустом query', () => {
    expect(filterTreeByQuery(tree, '')).toEqual(tree);
    expect(filterTreeByQuery(tree, '   ')).toEqual(tree);
  });

  it('фильтрует по совпадению label (case-insensitive)', () => {
    const result = filterTreeByQuery(tree, 'user');
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('doc1');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].children).toHaveLength(1);
    expect(result[0].children![0].children![0].label).toBe('user.yaml');
  });

  it('включает родителей при совпадении потомков', () => {
    const result = filterTreeByQuery(tree, 'order');
    expect(result[0].key).toBe('doc1');
    expect(result[0].children![0].label).toBe('schemas');
    expect(result[0].children![0].children![0].label).toBe('order.yaml');
  });

  it('trim query', () => {
    const result = filterTreeByQuery(tree, '  auth  ');
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('doc2');
  });

  it('возвращает пустой массив при отсутствии совпадений', () => {
    expect(filterTreeByQuery(tree, 'nonexistent')).toEqual([]);
  });

  it('сохраняет структуру совпадающих узлов', () => {
    const result = filterTreeByQuery(tree, 'openapi');
    expect(result[0].label).toBe('openapi-spec');
    expect(result[0].children).toBeDefined();
  });

  it('использует пустую строку для node.label когда label undefined (branch 14)', () => {
    const treeWithNoLabel: TreeNode[] = [
      { key: 'a', label: undefined as unknown as string, children: [{ key: 'b', label: 'needle' }] },
    ];
    const result = filterTreeByQuery(treeWithNoLabel, 'needle');
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('a');
  });
});
