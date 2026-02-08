import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUploadSpec } from '@/features/upload-spec/hook/use-upload-spec';
import type { UploadYamlResponse } from '@/shared/types';

vi.mock('@/shared/api', () => ({
  splitterApi: {
    uploadYaml: vi.fn(),
  },
}));

const { splitterApi } = await import('@/shared/api');

const createMockResponse = (totalFiles: number): UploadYamlResponse => ({
  rootFile: { id: '1', path: '/', originalName: 'api.yaml', size: 0, createdAt: '' },
  tree: [],
  totalFiles,
});

describe('useUploadSpec', () => {
  beforeEach(() => {
    vi.mocked(splitterApi.uploadYaml).mockReset();
  });

  it('загружает файл и возвращает результат', async () => {
    const mockResult = createMockResponse(5);
    vi.mocked(splitterApi.uploadYaml).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useUploadSpec());

    const file = new File(['content'], 'api.yaml');
    const uploadPromise = result.current.uploadFile(file);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const res = await uploadPromise;
    expect(res).toEqual(mockResult);

    await waitFor(() => expect(result.current.data).toEqual(mockResult));
  });

  it('передаёт path в uploadYaml при вызове uploadFile(file, path)', async () => {
    const mockResult = createMockResponse(1);
    vi.mocked(splitterApi.uploadYaml).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useUploadSpec());

    const file = new File(['x'], 'api.yaml');
    await result.current.uploadFile(file, '/custom/path');

    expect(splitterApi.uploadYaml).toHaveBeenCalledWith(file, '/custom/path');
  });

  it('при Error использует err.message (branch 29 true)', async () => {
    vi.mocked(splitterApi.uploadYaml).mockRejectedValue(new Error('Upload failed'));

    const { result } = renderHook(() => useUploadSpec());

    const file = new File(['content'], 'api.yaml');
    await expect(result.current.uploadFile(file)).rejects.toThrow('Upload failed');

    await waitFor(() => expect(result.current.error).toBe('Upload failed'));
  });

  it('при не-Error использует fallback "Ошибка загрузки файла" (branch 29 false)', async () => {
    vi.mocked(splitterApi.uploadYaml).mockRejectedValue('string error');

    const { result } = renderHook(() => useUploadSpec());

    const file = new File(['content'], 'api.yaml');
    let thrown: unknown;
    try {
      await result.current.uploadFile(file);
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBe('string error');
    await waitFor(() => expect(result.current.error).toBe('Ошибка загрузки файла'));
  });

  it('при reject с не-Error объектом использует fallback (branch 29 false)', async () => {
    vi.mocked(splitterApi.uploadYaml).mockRejectedValue({ code: 500 });

    const { result } = renderHook(() => useUploadSpec());

    await expect(result.current.uploadFile(new File([], 'x.yaml'))).rejects.toEqual({ code: 500 });

    await waitFor(() => expect(result.current.error).toBe('Ошибка загрузки файла'));
  });

  it('при reject с undefined использует fallback (branch 29 false)', async () => {
    vi.mocked(splitterApi.uploadYaml).mockRejectedValue(undefined);

    const { result } = renderHook(() => useUploadSpec());

    await expect(result.current.uploadFile(new File([], 'x.yaml'))).rejects.toBeUndefined();

    await waitFor(() => expect(result.current.error).toBe('Ошибка загрузки файла'));
  });

  it('reset очищает состояние', async () => {
    vi.mocked(splitterApi.uploadYaml).mockResolvedValue(createMockResponse(1));
    const { result } = renderHook(() => useUploadSpec());

    await result.current.uploadFile(new File(['x'], 'a.yaml'));
    
    await waitFor(() => expect(result.current.data).not.toBeNull());

    result.current.reset();
    
    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
