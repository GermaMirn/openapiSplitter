import { describe, it, expect, vi } from 'vitest';
import { ExportZipUseCase } from '@/application/use-cases/export-zip.use-case';
import { DomainException } from '@/domain/exceptions';

describe('ExportZipUseCase', () => {
  it('возвращает stream архива (успех)', async () => {
    const mockListFiles = vi.fn().mockResolvedValue([
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        path: 'docs/spec/openapi.yaml',
      },
    ]);
    const mockGetFileContent = vi.fn().mockResolvedValue(Buffer.from('openapi: 3.0.0'));
    const filesServiceClient = {
      listFiles: mockListFiles,
      getFileContent: mockGetFileContent,
    } as never;
    const useCase = new ExportZipUseCase(filesServiceClient);

    const result = await useCase.execute('docs/spec');

    expect(result).toBeDefined();
    expect(typeof result.pipe).toBe('function');
    expect(mockListFiles).toHaveBeenCalledWith('docs/spec');
  });

  it('выбрасывает DomainException когда нет файлов по пути (ошибка)', async () => {
    const mockListFiles = vi.fn().mockResolvedValue([]);
    const filesServiceClient = { listFiles: mockListFiles } as never;
    const useCase = new ExportZipUseCase(filesServiceClient);

    try {
      await useCase.execute('empty/path');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(DomainException);
      expect((e as DomainException).code).toBe('NO_FILES_FOUND');
    }
  });

  it('выбрасывает Error когда getFileContent падает (ошибка)', async () => {
    const mockListFiles = vi.fn().mockResolvedValue([
      { id: 'id1', path: 'docs/spec/openapi.yaml' },
    ]);
    const mockGetFileContent = vi.fn().mockRejectedValue(new Error('Network error'));
    const filesServiceClient = {
      listFiles: mockListFiles,
      getFileContent: mockGetFileContent,
    } as never;
    const useCase = new ExportZipUseCase(filesServiceClient);

    await expect(useCase.execute('docs/spec')).rejects.toThrow(/Failed to add file.*Network error/);
  });

  it('getRelativePath возвращает полный путь если не начинается с basePrefix (успех)', async () => {
    const mockListFiles = vi.fn().mockResolvedValue([
      { id: 'id1', path: 'other/file.yaml' },
    ]);
    const mockGetFileContent = vi.fn().mockResolvedValue(Buffer.from('content'));
    const filesServiceClient = {
      listFiles: mockListFiles,
      getFileContent: mockGetFileContent,
    } as never;
    const useCase = new ExportZipUseCase(filesServiceClient);

    const result = await useCase.execute('docs/spec');

    expect(result).toBeDefined();
    expect(mockGetFileContent).toHaveBeenCalled();
  });
});
