import { describe, it, expect, vi } from 'vitest';
import { UploadFileUseCase } from '@/application/use-cases/upload-file.use-case';
import { DomainException } from '@/domain/exceptions';

const createMockFile = () => ({
  id: { toString: () => '123e4567-e89b-12d3-a456-426614174000' },
  path: { toString: () => 'docs/api.yaml' },
  originalName: 'api.yaml',
  size: 10,
  mimeType: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
});

describe('UploadFileUseCase', () => {
  it('загружает новый файл (успех)', async () => {
    const mockFindByPath = vi.fn().mockResolvedValue(null);
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const fileRepository = {
      findByPath: mockFindByPath,
      save: mockSave,
    } as never;
    const fileStorage = { save: mockSave } as never;
    const useCase = new UploadFileUseCase(fileRepository, fileStorage);

    const buffer = Buffer.from('content');
    const result = await useCase.execute({
      path: 'docs/api.yaml',
      originalName: 'api.yaml',
      buffer,
    });

    expect(result.id).toBeDefined();
    expect(result.path).toBe('docs/api.yaml');
    expect(result.originalName).toBe('api.yaml');
    expect(result.size).toBe(buffer.length);
    expect(mockFindByPath).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
  });

  it('перезаписывает существующий файл (успех)', async () => {
    const existing = createMockFile();
    const mockFindByPath = vi.fn().mockResolvedValue(existing);
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const mockDeleteRepo = vi.fn().mockResolvedValue(undefined);
    const fileRepository = {
      findByPath: mockFindByPath,
      save: mockSave,
      delete: mockDeleteRepo,
    } as never;
    const fileStorage = { save: mockSave, delete: mockDelete } as never;
    const useCase = new UploadFileUseCase(fileRepository, fileStorage);

    const buffer = Buffer.from('new content');
    await useCase.execute({
      path: 'docs/api.yaml',
      originalName: 'api.yaml',
      buffer,
    });

    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteRepo).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
  });

  it('выбрасывает DomainException для невалидного пути (ошибка)', async () => {
    const fileRepository = {} as never;
    const fileStorage = {} as never;
    const useCase = new UploadFileUseCase(fileRepository, fileStorage);

    await expect(
      useCase.execute({
        path: '',
        originalName: 'api.yaml',
        buffer: Buffer.from('x'),
      })
    ).rejects.toThrow(DomainException);
  });
});
