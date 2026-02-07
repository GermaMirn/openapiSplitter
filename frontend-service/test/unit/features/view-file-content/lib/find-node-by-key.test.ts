import { describe, it, expect } from 'vitest';
import { findNodeByKey } from '@/features/view-file-content/lib/find-node-by-key';
import type { TreeNode } from '@/shared/types';

const tree: TreeNode[] = [
  {
    key: 'a',
    label: 'a',
    children: [
      { key: 'b', label: 'b', children: [{ key: 'c', label: 'c' }] },
    ],
  },
];

describe('findNodeByKey', () => {
  it('находит корневой узел', () => {
    const node = findNodeByKey(tree, 'a');
    expect(node).not.toBeNull();
    expect(node!.key).toBe('a');
  });

  it('находит вложенный узел', () => {
    const node = findNodeByKey(tree, 'c');
    expect(node).not.toBeNull();
    expect(node!.key).toBe('c');
  });

  it('возвращает null для несуществующего ключа', () => {
    expect(findNodeByKey(tree, 'x')).toBeNull();
  });

  it('возвращает null для пустого дерева', () => {
    expect(findNodeByKey([], 'a')).toBeNull();
  });

  it('возвращает null при undefined nodes', () => {
    expect(findNodeByKey(undefined, 'a')).toBeNull();
  });
});
