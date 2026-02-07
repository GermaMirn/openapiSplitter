import { describe, it, expect, vi } from 'vitest';
import { DeleteFileUseCase } from '@/application/use-cases/delete-file.use-case';
import { DomainException, FileNotFoundError } from '@/domain/exceptions';

const createMockFile = () => ({
  id: { toString: () => '123e4567-e89b-12d3-a456-426614174000' },
  path: { toString: () => 'docs/api.yaml' },
  originalName: 'api.yaml',
  size: 100,
  mimeType: null,
  createdAt: new Date(),
});

describe('DeleteFileUseCase', () => {
  it('удаляет файл (метаданные + содержимое) (успех)', async () => {
    const mockFile = createMockFile();
    const mockFindById = vi.fn().mockResolvedValue(mockFile);
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const fileRepository = { findById: mockFindById, delete: mockDelete } as never;
    const fileStorage = { delete: mockDelete } as never;
    const useCase = new DeleteFileUseCase(fileRepository, fileStorage);

    await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(mockFindById).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalled();
  });

  it('выбрасывает FileNotFoundError если файл не найден (ошибка)', async () => {
    const mockFindById = vi.fn().mockResolvedValue(null);
    const mockDelete = vi.fn();
    const fileRepository = { findById: mockFindById, delete: mockDelete } as never;
    const fileStorage = { delete: mockDelete } as never;
    const useCase = new DeleteFileUseCase(fileRepository, fileStorage);

    await expect(
      useCase.execute('123e4567-e89b-12d3-a456-426614174000')
    ).rejects.toThrow(FileNotFoundError);

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('выбрасывает DomainException для невалидного id (ошибка)', async () => {
    const fileRepository = {} as never;
    const fileStorage = {} as never;
    const useCase = new DeleteFileUseCase(fileRepository, fileStorage);

    await expect(useCase.execute('invalid-uuid')).rejects.toThrow(DomainException);
  });
});
