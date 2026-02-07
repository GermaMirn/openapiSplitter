import { describe, it, expect, vi } from 'vitest';
import { GetFileContentUseCase } from '@/application/use-cases/get-file-content.use-case';
import { FileNotFoundError } from '@/domain/exceptions';

describe('GetFileContentUseCase', () => {
  it('возвращает файл с контентом (успех)', async () => {
    const mockFile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      path: 'docs/api/openapi.yaml',
      originalName: 'api.yaml',
      size: 100,
      mimeType: 'application/yaml',
      createdAt: '2024-01-01T00:00:00Z',
    };
    const mockContent = Buffer.from('openapi: 3.0.0');
    const mockGetFile = vi.fn().mockResolvedValue(mockFile);
    const mockGetFileContent = vi.fn().mockResolvedValue(mockContent);
    const filesServiceClient = {
      getFile: mockGetFile,
      getFileContent: mockGetFileContent,
    } as never;
    const useCase = new GetFileContentUseCase(filesServiceClient);

    const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(result.metadata).toEqual(mockFile);
    expect(result.content).toBe('openapi: 3.0.0');
  });

  it('выбрасывает FileNotFoundError для невалидного id (ошибка)', async () => {
    const filesServiceClient = {} as never;
    const useCase = new GetFileContentUseCase(filesServiceClient);

    await expect(useCase.execute('invalid-uuid')).rejects.toThrow(FileNotFoundError);
  });
});
