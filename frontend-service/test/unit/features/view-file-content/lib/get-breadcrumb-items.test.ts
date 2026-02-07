import { describe, it, expect } from 'vitest';
import { getBreadcrumbItems } from '@/features/view-file-content/lib/get-breadcrumb-items';
import type { TreeNode } from '@/shared/types';

const tree: TreeNode[] = [
  {
    key: 'doc',
    label: 'my-api',
    data: { type: 'document' },
    children: [
      {
        key: 'doc-schemas',
        label: 'schemas',
        data: { type: 'folder' },
        children: [
          { key: 'doc-user', label: 'user.yaml', data: { type: 'file' } },
        ],
      },
    ],
  },
];

describe('getBreadcrumbItems', () => {
  it('возвращает один элемент для корневого узла', () => {
    const result = getBreadcrumbItems(tree, 'doc');
    expect(result).toEqual([{ key: 'doc', label: 'my-api' }]);
  });

  it('возвращает полный путь от корня до выбранного узла', () => {
    const result = getBreadcrumbItems(tree, 'doc-user');
    expect(result).toEqual([
      { key: 'doc', label: 'my-api' },
      { key: 'doc-schemas', label: 'schemas' },
      { key: 'doc-user', label: 'user.yaml' },
    ]);
  });

  it('возвращает промежуточный путь', () => {
    const result = getBreadcrumbItems(tree, 'doc-schemas');
    expect(result).toEqual([
      { key: 'doc', label: 'my-api' },
      { key: 'doc-schemas', label: 'schemas' },
    ]);
  });

  it('возвращает пустой массив для несуществующего ключа', () => {
    const result = getBreadcrumbItems(tree, 'missing');
    expect(result).toEqual([]);
  });
});
