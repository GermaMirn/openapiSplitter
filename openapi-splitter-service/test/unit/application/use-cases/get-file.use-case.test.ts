import { describe, it, expect, vi } from 'vitest';
import { GetFileUseCase } from '@/application/use-cases/get-file.use-case';
import { FileNotFoundError } from '@/domain/exceptions';

describe('GetFileUseCase', () => {
  it('возвращает метаданные файла (успех)', async () => {
    const mockFile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      path: 'docs/api/openapi.yaml',
      originalName: 'api.yaml',
      size: 100,
      mimeType: 'application/yaml',
      createdAt: '2024-01-01T00:00:00Z',
    };
    const mockGetFile = vi.fn().mockResolvedValue(mockFile);
    const filesServiceClient = { getFile: mockGetFile } as never;
    const useCase = new GetFileUseCase(filesServiceClient);

    const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(result).toEqual(mockFile);
    expect(mockGetFile).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
  });

  it('выбрасывает FileNotFoundError для невалидного id (ошибка)', async () => {
    const filesServiceClient = {} as never;
    const useCase = new GetFileUseCase(filesServiceClient);

    await expect(useCase.execute('invalid-uuid')).rejects.toThrow(FileNotFoundError);
    await expect(useCase.execute('')).rejects.toThrow(FileNotFoundError);
  });
});
