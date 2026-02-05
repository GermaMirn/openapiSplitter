import type { IFileRepository } from '@/domain/interfaces';
import { FileId } from '@/domain/value-objects';
import { FileNotFoundError } from '@/domain/exceptions';
import type { FileDto } from '@/application/dto';
import { fileToDto } from '@/application/dto';

/**
 * Use case получения метаданных файла по ID
 */
export class GetFileUseCase {
  constructor(private readonly fileRepository: IFileRepository) {}

  async execute(id: string): Promise<FileDto> {
    const fileId = FileId.fromString(id);
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }
    return fileToDto(file);
  }
}
