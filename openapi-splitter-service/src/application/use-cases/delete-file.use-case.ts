import { validate as uuidValidate } from 'uuid';
import type { FilesServiceClient } from '@/infrastructure/external';
import { FileNotFoundError } from '@/domain/exceptions';

/**
 * Use case: удаление одного файла по id
 */
export class DeleteFileUseCase {
  constructor(private readonly filesServiceClient: FilesServiceClient) {}

  async execute(id: string): Promise<void> {
    if (!id || !uuidValidate(id)) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }
    await this.filesServiceClient.deleteFile(id);
  }
}
