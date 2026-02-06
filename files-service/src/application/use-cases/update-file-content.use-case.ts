import { validate as uuidValidate } from 'uuid';
import type { IFileRepository, IFileStorage } from '@/domain/interfaces';
import { FileId } from '@/domain/value-objects';
import { FileNotFoundError } from '@/domain/exceptions';

/**
 * Input для обновления содержимого файла
 */
export interface UpdateFileContentInput {
  id: string;
  buffer: Buffer;
}

/**
 * Use case: обновление содержимого файла
 */
export class UpdateFileContentUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(input: UpdateFileContentInput): Promise<void> {
    const { id, buffer } = input;

    if (!uuidValidate(id)) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }

    const fileId = FileId.fromString(id);
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }

    await this.fileStorage.save(file.path, buffer);
    await this.fileRepository.updateSize(id, buffer.length);
  }
}
