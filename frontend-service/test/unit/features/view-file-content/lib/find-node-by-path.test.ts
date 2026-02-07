import { describe, it, expect } from 'vitest';
import { findNodeByPath } from '@/features/view-file-content/lib/find-node-by-path';
import type { TreeNode } from '@/shared/types';

const tree: TreeNode[] = [
  {
    key: 'doc1',
    label: 'api',
    data: { type: 'document', path: 'api' },
    children: [
      {
        key: 'doc1-f1',
        label: 'openapi.yaml',
        data: { type: 'file', path: 'api/openapi.yaml' },
      },
    ],
  },
];

describe('findNodeByPath', () => {
  it('находит узел по path', () => {
    const node = findNodeByPath(tree, 'api/openapi.yaml');
    expect(node).not.toBeNull();
    expect(node!.key).toBe('doc1-f1');
  });

  it('находит корневой узел по path', () => {
    const node = findNodeByPath(tree, 'api');
    expect(node).not.toBeNull();
    expect(node!.key).toBe('doc1');
  });

  it('возвращает null для несуществующего path', () => {
    expect(findNodeByPath(tree, 'other/path.yaml')).toBeNull();
  });

  it('возвращает null для пустого дерева', () => {
    expect(findNodeByPath([], 'api')).toBeNull();
  });
});
