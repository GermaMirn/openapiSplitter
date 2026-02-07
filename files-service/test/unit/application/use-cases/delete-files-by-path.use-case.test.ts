import { describe, it, expect, vi } from 'vitest';
import { DeleteFilesByPathPrefixUseCase } from '@/application/use-cases/delete-files-by-path.use-case';

const createMockFile = (path: string) => ({
  id: { toString: () => 'id' },
  path: { toString: () => path },
  originalName: 'file.yaml',
  size: 10,
  mimeType: null,
  createdAt: new Date(),
});

describe('DeleteFilesByPathPrefixUseCase', () => {
  it('удаляет все файлы по pathPrefix (успех)', async () => {
    const files = [
      createMockFile('docs/api/file1.yaml'),
      createMockFile('docs/api/file2.yaml'),
    ];
    const mockFindManyByPathPrefix = vi.fn().mockResolvedValue(files);
    const mockDeleteManyByPathPrefix = vi.fn().mockResolvedValue(undefined);
    const mockStorageDelete = vi.fn().mockResolvedValue(undefined);
    const fileRepository = {
      findManyByPathPrefix: mockFindManyByPathPrefix,
      deleteManyByPathPrefix: mockDeleteManyByPathPrefix,
    } as never;
    const fileStorage = { delete: mockStorageDelete } as never;
    const useCase = new DeleteFilesByPathPrefixUseCase(fileRepository, fileStorage);

    await useCase.execute('docs/api');

    expect(mockFindManyByPathPrefix).toHaveBeenCalledWith('docs/api');
    expect(mockDeleteManyByPathPrefix).toHaveBeenCalledWith('docs/api');
    expect(mockStorageDelete).toHaveBeenCalledTimes(2);
  });

  it('ничего не удаляет при отсутствии файлов (успех)', async () => {
    const mockFindManyByPathPrefix = vi.fn().mockResolvedValue([]);
    const mockDeleteManyByPathPrefix = vi.fn().mockResolvedValue(undefined);
    const mockStorageDelete = vi.fn();
    const fileRepository = {
      findManyByPathPrefix: mockFindManyByPathPrefix,
      deleteManyByPathPrefix: mockDeleteManyByPathPrefix,
    } as never;
    const fileStorage = { delete: mockStorageDelete } as never;
    const useCase = new DeleteFilesByPathPrefixUseCase(fileRepository, fileStorage);

    await useCase.execute('empty/path');

    expect(mockDeleteManyByPathPrefix).toHaveBeenCalledWith('empty/path');
    expect(mockStorageDelete).not.toHaveBeenCalled();
  });
});
