import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDeleteFile } from '@/features/delete-file/hook/use-delete-file';

vi.mock('@/shared/api', () => ({
  splitterApi: {
    deleteFile: vi.fn(),
  },
}));

const { splitterApi } = await import('@/shared/api');

describe('useDeleteFile', () => {
  beforeEach(() => {
    vi.mocked(splitterApi.deleteFile).mockReset();
  });

  it('удаляет файл по id', async () => {
    vi.mocked(splitterApi.deleteFile).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteFile());

    result.current.deleteFile('file-id-123');

    await waitFor(() => expect(result.current.isDeleting).toBe(false));

    expect(splitterApi.deleteFile).toHaveBeenCalledWith('file-id-123');
  });

  it('пробрасывает ошибку при сбое', async () => {
    vi.mocked(splitterApi.deleteFile).mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useDeleteFile());

    await expect(result.current.deleteFile('bad-id')).rejects.toThrow('Not found');
  });

  it('обрабатывает не-Error ошибку', async () => {
    vi.mocked(splitterApi.deleteFile).mockRejectedValue('string error');

    const { result } = renderHook(() => useDeleteFile());

    await expect(result.current.deleteFile('file-id')).rejects.toBe('string error');
    
    await waitFor(() => expect(result.current.error).toBe('Ошибка удаления файла'));
  });
});
