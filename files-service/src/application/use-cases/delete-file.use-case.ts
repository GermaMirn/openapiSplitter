import type { IFileRepository, IFileStorage } from '@/domain/interfaces';
import { FileId } from '@/domain/value-objects';
import { FileNotFoundError } from '@/domain/exceptions';

/**
 * Use case удаления файла по ID (метаданные + содержимое)
 */
export class DeleteFileUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(id: string): Promise<void> {
    const fileId = FileId.fromString(id);
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }
    await this.fileStorage.delete(file.path);
    await this.fileRepository.delete(fileId);
  }
}
