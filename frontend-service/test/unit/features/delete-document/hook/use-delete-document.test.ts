import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDeleteDocument } from '@/features/delete-document/hook/use-delete-document';

vi.mock('@/shared/api', () => ({
  splitterApi: {
    deleteByPath: vi.fn(),
  },
}));

const { splitterApi } = await import('@/shared/api');

describe('useDeleteDocument', () => {
  beforeEach(() => {
    vi.mocked(splitterApi.deleteByPath).mockReset();
  });

  it('удаляет документ по пути', async () => {
    vi.mocked(splitterApi.deleteByPath).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDocument());

    result.current.deleteDocument('doc1');

    await waitFor(() => expect(result.current.isDeleting).toBe(false));

    expect(splitterApi.deleteByPath).toHaveBeenCalledWith('doc1');
  });

  it('пробрасывает ошибку и устанавливает error', async () => {
    vi.mocked(splitterApi.deleteByPath).mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useDeleteDocument());

    await expect(result.current.deleteDocument('doc1')).rejects.toThrow('Delete failed');
    
    await waitFor(() => expect(result.current.error).toBe('Delete failed'));
  });

  it('обрабатывает не-Error ошибку', async () => {
    vi.mocked(splitterApi.deleteByPath).mockRejectedValue('string error');

    const { result } = renderHook(() => useDeleteDocument());

    await expect(result.current.deleteDocument('doc1')).rejects.toBe('string error');
    
    await waitFor(() => expect(result.current.error).toBe('Ошибка удаления документа'));
  });
});
