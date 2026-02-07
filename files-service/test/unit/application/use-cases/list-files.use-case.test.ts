import { describe, it, expect, vi } from 'vitest';
import { ListFilesUseCase } from '@/application/use-cases/list-files.use-case';

const createMockFile = (id: string, path: string) => ({
  id: { toString: () => id },
  path: { toString: () => path },
  originalName: 'file.yaml',
  size: 10,
  mimeType: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
});

describe('ListFilesUseCase', () => {
  it('возвращает все файлы (успех)', async () => {
    const files = [
      createMockFile('id1', 'docs/api.yaml'),
      createMockFile('id2', 'docs/other.yaml'),
    ];
    const mockFindAll = vi.fn().mockResolvedValue(files);
    const fileRepository = { findAll: mockFindAll } as never;
    const useCase = new ListFilesUseCase(fileRepository);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].path).toBe('docs/api.yaml');
    expect(result[1].path).toBe('docs/other.yaml');
    expect(mockFindAll).toHaveBeenCalled();
  });

  it('возвращает файлы по pathPrefix (успех)', async () => {
    const files = [createMockFile('id1', 'docs/api/file.yaml')];
    const mockFindManyByPathPrefix = vi.fn().mockResolvedValue(files);
    const fileRepository = { findManyByPathPrefix: mockFindManyByPathPrefix } as never;
    const useCase = new ListFilesUseCase(fileRepository);

    const result = await useCase.execute({ pathPrefix: 'docs/api' });

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('docs/api/file.yaml');
    expect(mockFindManyByPathPrefix).toHaveBeenCalledWith('docs/api');
  });

  it('возвращает пустой массив при отсутствии файлов (успех)', async () => {
    const mockFindAll = vi.fn().mockResolvedValue([]);
    const fileRepository = { findAll: mockFindAll } as never;
    const useCase = new ListFilesUseCase(fileRepository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
