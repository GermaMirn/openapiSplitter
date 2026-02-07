import { describe, it, expect, vi } from 'vitest';
import { GetFileUseCase } from '@/application/use-cases/get-file.use-case';
import { DomainException, FileNotFoundError } from '@/domain/exceptions';

const createMockFile = () => ({
  id: { toString: () => '123e4567-e89b-12d3-a456-426614174000' },
  path: { toString: () => 'docs/api.yaml' },
  originalName: 'api.yaml',
  size: 100,
  mimeType: 'application/yaml',
  createdAt: new Date('2024-01-01T00:00:00Z'),
});

describe('GetFileUseCase', () => {
  it('возвращает метаданные файла (успех)', async () => {
    const mockFile = createMockFile();
    const mockFindById = vi.fn().mockResolvedValue(mockFile);
    const fileRepository = { findById: mockFindById } as never;
    const useCase = new GetFileUseCase(fileRepository);

    const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(result).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      path: 'docs/api.yaml',
      originalName: 'api.yaml',
      size: 100,
      mimeType: 'application/yaml',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
    expect(mockFindById).toHaveBeenCalled();
  });

  it('выбрасывает FileNotFoundError если файл не найден (ошибка)', async () => {
    const mockFindById = vi.fn().mockResolvedValue(null);
    const fileRepository = { findById: mockFindById } as never;
    const useCase = new GetFileUseCase(fileRepository);

    await expect(
      useCase.execute('123e4567-e89b-12d3-a456-426614174000')
    ).rejects.toThrow(FileNotFoundError);
  });

  it('выбрасывает DomainException для невалидного id (ошибка)', async () => {
    const fileRepository = {} as never;
    const useCase = new GetFileUseCase(fileRepository);

    await expect(useCase.execute('invalid-uuid')).rejects.toThrow(DomainException);
    await expect(useCase.execute('')).rejects.toThrow(DomainException);
  });
});
