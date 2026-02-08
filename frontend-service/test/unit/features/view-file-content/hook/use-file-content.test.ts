import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFileContent } from '@/features/view-file-content/hook/use-file-content';
import type { TreeNode } from '@/shared/types';

vi.mock('@/shared/api', () => ({
  splitterApi: {
    getFileContent: vi.fn(),
  },
}));

const { splitterApi } = await import('@/shared/api');

const nodesWithFileId: TreeNode[] = [
  {
    key: 'file1',
    label: 'openapi.yaml',
    data: { type: 'file', fileId: 'id-1', path: 'doc/openapi.yaml' },
  },
];

const nodesWithoutFileId: TreeNode[] = [
  { key: 'folder1', label: 'schemas', data: { type: 'folder' } },
];

describe('useFileContent', () => {
  beforeEach(() => {
    vi.mocked(splitterApi.getFileContent).mockReset();
  });

  it('возвращает null при selectedKey = null', () => {
    const { result } = renderHook(() => useFileContent(null, nodesWithFileId));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('возвращает заглушку для узла без fileId', async () => {
    const { result } = renderHook(() => useFileContent('folder1', nodesWithoutFileId));

    await waitFor(() => expect(result.current.data).not.toBeNull());

    expect(result.current.data?.label).toBe('schemas');
    expect(result.current.data?.content).toContain('Нет содержимого');
    expect(splitterApi.getFileContent).not.toHaveBeenCalled();
  });

  it('загружает контент по fileId', async () => {
    vi.mocked(splitterApi.getFileContent).mockResolvedValue({
      id: 'id-1',
      content: 'openapi: 3.0.0',
      name: 'openapi.yaml',
    } as never);

    const { result } = renderHook(() => useFileContent('file1', nodesWithFileId));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.content).toBe('openapi: 3.0.0');
  });

  it('устанавливает error при ошибке загрузки', async () => {
    vi.mocked(splitterApi.getFileContent).mockRejectedValue(new Error('404'));

    const { result } = renderHook(() => useFileContent('file1', nodesWithFileId));

    await waitFor(() => expect(result.current.error).toBe('404'));

    expect(result.current.data).toBeNull();
  });

  it('устанавливает fallback error при reject не-Error (branch 54)', async () => {
    vi.mocked(splitterApi.getFileContent).mockRejectedValue('string error');

    const { result } = renderHook(() => useFileContent('file1', nodesWithFileId));

    await waitFor(() => expect(result.current.error).toBe('Ошибка загрузки файла'));

    expect(result.current.data).toBeNull();
  });

  it('возвращает "Узел не найден" для несуществующего ключа', async () => {
    const { result } = renderHook(() => useFileContent('missing', nodesWithFileId));

    await waitFor(() => expect(result.current.error).toBe('Узел не найден'));
  });
});
