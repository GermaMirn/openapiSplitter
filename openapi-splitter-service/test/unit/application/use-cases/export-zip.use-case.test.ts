import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportZipUseCase } from '@/application/use-cases/export-zip.use-case';
import { DomainException } from '@/domain/exceptions';

const triggerArchiveError = vi.hoisted(() => ({ current: false }));
vi.mock('archiver', () => ({
  default: vi.fn(() => {
    const errCbs: Array<(e: Error) => void> = [];
    const archive: Record<string, unknown> = {
      on: vi.fn((ev: string, cb: (e: Error) => void) => {
        if (ev === 'error') errCbs.push(cb);
        return archive;
      }),
      append: vi.fn(() => {
        if (triggerArchiveError.current && errCbs.length) errCbs[0](new Error('zip error'));
      }),
      finalize: vi.fn().mockResolvedValue(undefined),
      pipe: vi.fn(),
    };
    return archive;
  }),
}));

describe('ExportZipUseCase', () => {
  beforeEach(() => {
    triggerArchiveError.current = false;
  });
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

  it('использует Unknown error когда getFileContent отклоняет не-Error (branch)', async () => {
    const mockListFiles = vi.fn().mockResolvedValue([
      { id: 'id1', path: 'docs/spec/openapi.yaml' },
    ]);
    const mockGetFileContent = vi.fn().mockRejectedValue('non-Error reject');
    const filesServiceClient = {
      listFiles: mockListFiles,
      getFileContent: mockGetFileContent,
    } as never;
    const useCase = new ExportZipUseCase(filesServiceClient);

    await expect(useCase.execute('docs/spec')).rejects.toThrow(/Failed to add file.*Unknown error/);
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

  it('выбрасывает при ошибке архиватора (archive.on error)', async () => {
    triggerArchiveError.current = true;
    const mockListFiles = vi.fn().mockResolvedValue([
      { id: 'id1', path: 'docs/spec/openapi.yaml' },
    ]);
    const mockGetFileContent = vi.fn().mockResolvedValue(Buffer.from('content'));
    const filesServiceClient = {
      listFiles: mockListFiles,
      getFileContent: mockGetFileContent,
    } as never;
    const useCase = new ExportZipUseCase(filesServiceClient);

    await expect(useCase.execute('docs/spec')).rejects.toThrow(/Archive creation failed.*zip error/);
  });
});
