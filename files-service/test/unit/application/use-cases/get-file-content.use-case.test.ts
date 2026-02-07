import { describe, it, expect, vi } from 'vitest';
import { GetFileContentUseCase } from '@/application/use-cases/get-file-content.use-case';
import { DomainException, FileNotFoundError } from '@/domain/exceptions';

const createMockFile = () => ({
  id: { toString: () => '123e4567-e89b-12d3-a456-426614174000' },
  path: { toString: () => 'docs/api.yaml' },
  originalName: 'api.yaml',
  size: 100,
  mimeType: null,
  createdAt: new Date(),
});

describe('GetFileContentUseCase', () => {
  it('возвращает содержимое файла (успех)', async () => {
    const content = Buffer.from('file content');
    const mockFile = createMockFile();
    const mockFindById = vi.fn().mockResolvedValue(mockFile);
    const mockRead = vi.fn().mockResolvedValue(content);
    const fileRepository = { findById: mockFindById } as never;
    const fileStorage = { read: mockRead } as never;
    const useCase = new GetFileContentUseCase(fileRepository, fileStorage);

    const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(result).toEqual(content);
    expect(mockRead).toHaveBeenCalled();
  });

  it('выбрасывает FileNotFoundError если файл не найден (ошибка)', async () => {
    const mockFindById = vi.fn().mockResolvedValue(null);
    const mockRead = vi.fn();
    const fileRepository = { findById: mockFindById } as never;
    const fileStorage = { read: mockRead } as never;
    const useCase = new GetFileContentUseCase(fileRepository, fileStorage);

    await expect(
      useCase.execute('123e4567-e89b-12d3-a456-426614174000')
    ).rejects.toThrow(FileNotFoundError);

    expect(mockRead).not.toHaveBeenCalled();
  });

  it('выбрасывает DomainException для невалидного id (ошибка)', async () => {
    const fileRepository = {} as never;
    const fileStorage = {} as never;
    const useCase = new GetFileContentUseCase(fileRepository, fileStorage);

    await expect(useCase.execute('invalid-uuid')).rejects.toThrow(DomainException);
  });
});
