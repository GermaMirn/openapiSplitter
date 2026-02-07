import { describe, it, expect } from 'vitest';
import { addIconsToNodes } from '@/features/file-tree-data/model/map-tree-icons';
import type { TreeNode } from '@/shared/types';

describe('addIconsToNodes', () => {
  it('добавляет иконку по типу document', () => {
    const nodes: TreeNode[] = [
      { key: '1', label: 'doc', data: { type: 'document' } },
    ];
    const result = addIconsToNodes(nodes);
    expect(result[0].icon).toBe('pi pi-file');
  });

  it('добавляет иконку по типу folder', () => {
    const nodes: TreeNode[] = [
      { key: '1', label: 'folder', data: { type: 'folder' } },
    ];
    const result = addIconsToNodes(nodes);
    expect(result[0].icon).toBe('pi pi-folder');
  });

  it('рекурсивно обрабатывает children', () => {
    const nodes: TreeNode[] = [
      {
        key: '1',
        label: 'root',
        data: { type: 'document' },
        children: [{ key: '2', label: 'child', data: { type: 'file' } }],
      },
    ];
    const result = addIconsToNodes(nodes);
    expect(result[0].icon).toBe('pi pi-file');
    expect(result[0].children![0].icon).toBe('pi pi-file');
  });

  it('использует folder по умолчанию при отсутствии type', () => {
    const nodes: TreeNode[] = [{ key: '1', label: 'x' }];
    const result = addIconsToNodes(nodes);
    expect(result[0].icon).toBe('pi pi-folder');
  });
});
