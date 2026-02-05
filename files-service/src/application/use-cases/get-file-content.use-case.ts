import type { IFileRepository, IFileStorage } from '@/domain/interfaces';
import { FileId } from '@/domain/value-objects';
import { FileNotFoundError } from '@/domain/exceptions';

/**
 * Use case получения содержимого файла по ID
 */
export class GetFileContentUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(id: string): Promise<Buffer> {
    const fileId = FileId.fromString(id);
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }
    return this.fileStorage.read(file.path);
  }
}
