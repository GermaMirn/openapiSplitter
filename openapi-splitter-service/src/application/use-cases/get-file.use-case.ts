import { validate as uuidValidate } from 'uuid';
import type { FilesServiceClient } from '@/infrastructure/external';
import type { FileMetadataDto } from '@/application/dto';
import { FileNotFoundError } from '@/domain/exceptions';

/**
 * Use case: получение метаданных файла по id
 */
export class GetFileUseCase {
  constructor(private readonly filesServiceClient: FilesServiceClient) {}

  async execute(id: string): Promise<FileMetadataDto> {
    if (!id || !uuidValidate(id)) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }
    const file = await this.filesServiceClient.getFile(id);

    return {
      id: file.id,
      path: file.path,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    };
  }
}
