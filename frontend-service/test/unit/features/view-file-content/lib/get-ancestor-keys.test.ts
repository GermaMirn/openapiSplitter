import { describe, it, expect } from 'vitest';
import { getAncestorKeys } from '@/features/view-file-content/lib/get-ancestor-keys';
import type { TreeNode } from '@/shared/types';

const tree: TreeNode[] = [
  {
    key: 'root',
    label: 'root',
    children: [
      {
        key: 'child',
        label: 'child',
        children: [
          { key: 'grandchild', label: 'grandchild', data: { type: 'file' } },
        ],
      },
    ],
  },
];

describe('getAncestorKeys', () => {
  it('возвращает пустой массив для корневого узла', () => {
    expect(getAncestorKeys(tree, 'root')).toEqual([]);
  });

  it('возвращает путь от корня до родителя', () => {
    expect(getAncestorKeys(tree, 'child')).toEqual(['root']);
    expect(getAncestorKeys(tree, 'grandchild')).toEqual(['root', 'child']);
  });

  it('возвращает пустой массив для несуществующего ключа', () => {
    expect(getAncestorKeys(tree, 'missing')).toEqual([]);
  });

  it('работает с плоским деревом', () => {
    const flat: TreeNode[] = [
      { key: 'a', label: 'a' },
      { key: 'b', label: 'b' },
    ];
    expect(getAncestorKeys(flat, 'a')).toEqual([]);
    expect(getAncestorKeys(flat, 'b')).toEqual([]);
  });
});
