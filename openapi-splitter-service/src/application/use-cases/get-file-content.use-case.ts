import { validate as uuidValidate } from 'uuid';
import type { FilesServiceClient } from '@/infrastructure/external';
import type { FileWithContentDto } from '@/application/dto';
import { FileNotFoundError } from '@/domain/exceptions';

/**
 * Use case: получение файла с контентом
 */
export class GetFileContentUseCase {
  constructor(private readonly filesServiceClient: FilesServiceClient) {}

  async execute(id: string): Promise<FileWithContentDto> {
    if (!id || !uuidValidate(id)) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }
    // Получаем метаданные и контент параллельно
    const [file, contentBuffer] = await Promise.all([
      this.filesServiceClient.getFile(id),
      this.filesServiceClient.getFileContent(id),
    ]);

    const content = contentBuffer.toString('utf-8');

    return {
      metadata: {
        id: file.id,
        path: file.path,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
      },
      content,
    };
  }
}
