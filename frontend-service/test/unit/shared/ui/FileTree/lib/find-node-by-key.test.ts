import { describe, it, expect } from 'vitest';
import { findNodeByKey } from '@/shared/ui/FileTree/lib/find-node-by-key';
import type { TreeNode as PrimeTreeNode } from 'primereact/treenode';

const tree: PrimeTreeNode[] = [
  {
    key: 'a',
    label: 'a',
    children: [
      { key: 'b', label: 'b', children: [{ key: 'c', label: 'c' }] },
    ],
  },
];

describe('FileTree findNodeByKey', () => {
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

  it('возвращает null для пустого массива', () => {
    expect(findNodeByKey([], 'a')).toBeNull();
  });

  it('возвращает null при undefined', () => {
    expect(findNodeByKey(undefined, 'a')).toBeNull();
  });

  it('находит узел по node.id когда key отсутствует (branch 6)', () => {
    const treeWithId: PrimeTreeNode[] = [
      { id: 'node-id', label: 'By id', children: [] },
    ];
    const node = findNodeByKey(treeWithId, 'node-id');
    expect(node).not.toBeNull();
    expect(node!.id).toBe('node-id');
  });

  it('использует пустую строку когда key и id отсутствуют (branch 6)', () => {
    const treeNoKey: PrimeTreeNode[] = [{ label: 'Empty key', children: [] }];
    const node = findNodeByKey(treeNoKey, '');
    expect(node).not.toBeNull();
    expect(node!.label).toBe('Empty key');
  });
});
