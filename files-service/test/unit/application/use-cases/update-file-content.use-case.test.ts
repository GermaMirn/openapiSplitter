import { describe, it, expect, vi } from 'vitest';
import { UpdateFileContentUseCase } from '@/application/use-cases/update-file-content.use-case';
import { FileNotFoundError } from '@/domain/exceptions';

const createMockFile = () => ({
  id: { toString: () => '123e4567-e89b-12d3-a456-426614174000' },
  path: { toString: () => 'docs/api.yaml' },
  originalName: 'api.yaml',
  size: 100,
  mimeType: null,
  createdAt: new Date(),
});

describe('UpdateFileContentUseCase', () => {
  it('обновляет содержимое файла (успех)', async () => {
    const mockFile = createMockFile();
    const mockFindById = vi.fn().mockResolvedValue(mockFile);
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockUpdateSize = vi.fn().mockResolvedValue(undefined);
    const fileRepository = {
      findById: mockFindById,
      updateSize: mockUpdateSize,
    } as never;
    const fileStorage = { save: mockSave } as never;
    const useCase = new UpdateFileContentUseCase(fileRepository, fileStorage);

    const buffer = Buffer.from('new content');
    await useCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      buffer,
    });

    expect(mockSave).toHaveBeenCalled();
    expect(mockUpdateSize).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', buffer.length);
  });

  it('выбрасывает FileNotFoundError если файл не найден (ошибка)', async () => {
    const mockFindById = vi.fn().mockResolvedValue(null);
    const fileRepository = { findById: mockFindById, updateSize: vi.fn() } as never;
    const fileStorage = { save: vi.fn() } as never;
    const useCase = new UpdateFileContentUseCase(fileRepository, fileStorage);

    await expect(
      useCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        buffer: Buffer.from('x'),
      })
    ).rejects.toThrow(FileNotFoundError);
  });

  it('выбрасывает FileNotFoundError для невалидного id (ошибка)', async () => {
    const fileRepository = {} as never;
    const fileStorage = {} as never;
    const useCase = new UpdateFileContentUseCase(fileRepository, fileStorage);

    await expect(
      useCase.execute({
        id: 'invalid-uuid',
        buffer: Buffer.from('x'),
      })
    ).rejects.toThrow(FileNotFoundError);
  });
});
