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
});
