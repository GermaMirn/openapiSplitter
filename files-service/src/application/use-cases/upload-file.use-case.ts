import type { IFileRepository, IFileStorage } from '@/domain/interfaces';
import { File } from '@/domain/entities';
import { FileId, FilePath } from '@/domain/value-objects';
import { type UploadFileInput, type FileDto, fileToDto } from '@/application/dto';

/**
 * Use case загрузки файла
 */
export class UploadFileUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(input: UploadFileInput): Promise<FileDto> {
    const path = FilePath.create(input.path);

    const existing = await this.fileRepository.findByPath(path);
    if (existing) {
      await this.fileStorage.delete(existing.path);
      await this.fileRepository.delete(existing.id);
    }

    const id = FileId.create();
    const file = File.create(
      id,
      path,
      input.originalName,
      input.buffer.length,
      input.mimeType ?? null
    );

    await this.fileStorage.save(path, input.buffer);
    await this.fileRepository.save(file);

    return fileToDto(file);
  }
}
