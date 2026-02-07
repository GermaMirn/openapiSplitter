import { describe, it, expect, vi } from 'vitest';
import { DeleteByPathUseCase } from '@/application/use-cases/delete-by-path.use-case';
import { DomainException } from '@/domain/exceptions';

describe('DeleteByPathUseCase', () => {
  it('удаляет файлы по пути (успех)', async () => {
    const mockDeleteFilesByPath = vi.fn().mockResolvedValue(undefined);
    const filesServiceClient = { deleteFilesByPath: mockDeleteFilesByPath } as never;
    const useCase = new DeleteByPathUseCase(filesServiceClient);

    await useCase.execute('docs/spec');

    expect(mockDeleteFilesByPath).toHaveBeenCalledWith('docs/spec');
  });

  it('выбрасывает DomainException для невалидного пути (ошибка)', async () => {
    const filesServiceClient = {} as never;
    const useCase = new DeleteByPathUseCase(filesServiceClient);

    await expect(useCase.execute('..')).rejects.toThrow(DomainException);
  });
});
