import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useExportZip } from '@/features/export-zip/hook/use-export-zip';

vi.mock('@/shared/api', () => ({
  splitterApi: {
    exportZip: vi.fn(),
  },
}));

const { splitterApi } = await import('@/shared/api');

describe('useExportZip', () => {
  beforeEach(() => {
    vi.mocked(splitterApi.exportZip).mockReset();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('экспортирует ZIP и создаёт ссылку для скачивания', async () => {
    const blob = new Blob(['zip-content']);
    vi.mocked(splitterApi.exportZip).mockResolvedValue(blob);

    const { result } = renderHook(() => useExportZip());

    result.current.exportZip('doc1');

    await waitFor(() => expect(result.current.isExporting).toBe(false));

    expect(splitterApi.exportZip).toHaveBeenCalledWith('doc1');
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('пробрасывает ошибку при сбое', async () => {
    vi.mocked(splitterApi.exportZip).mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useExportZip());

    await expect(result.current.exportZip('doc1')).rejects.toThrow('Export failed');
    
    await waitFor(() => expect(result.current.error).toBe('Export failed'));
  });

  it('обрабатывает не-Error ошибку', async () => {
    vi.mocked(splitterApi.exportZip).mockRejectedValue('string error');

    const { result } = renderHook(() => useExportZip());

    await expect(result.current.exportZip('doc1')).rejects.toBe('string error');
    
    await waitFor(() => expect(result.current.error).toBe('Ошибка экспорта ZIP'));
  });
});
