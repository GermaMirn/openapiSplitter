import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFileTreeNodes } from '@/features/file-tree-data/hook/use-file-tree-nodes';
import type { TreeNode } from '@/shared/types';

vi.mock('@/shared/api', () => ({
  splitterApi: {
    getTree: vi.fn(),
  },
}));

const { splitterApi } = await import('@/shared/api');

describe('useFileTreeNodes', () => {
  beforeEach(() => {
    vi.mocked(splitterApi.getTree).mockReset();
  });

  it('загружает дерево при монтировании', async () => {
    const mockTree: TreeNode[] = [{ key: '1', label: 'doc', data: { type: 'document' } }];
    vi.mocked(splitterApi.getTree).mockResolvedValue(mockTree);

    const { result } = renderHook(() => useFileTreeNodes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].key).toBe('1');
    expect(result.current.nodes[0].icon).toBeDefined();
  });

  it('устанавливает error при ошибке API', async () => {
    vi.mocked(splitterApi.getTree).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFileTreeNodes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.nodes).toEqual([]);
  });

  it('refetch перезагружает дерево', async () => {
    vi.mocked(splitterApi.getTree)
      .mockResolvedValueOnce([{ key: '1', label: 'a' }] as TreeNode[])
      .mockResolvedValueOnce([{ key: '2', label: 'b' }] as TreeNode[]);

    const { result } = renderHook(() => useFileTreeNodes());

    await waitFor(() => expect(result.current.nodes[0]?.key).toBe('1'));

    await result.current.refetch();

    await waitFor(() => expect(result.current.nodes[0]?.key).toBe('2'));
  });
});
