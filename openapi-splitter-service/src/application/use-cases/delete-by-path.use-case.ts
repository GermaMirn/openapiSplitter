import type { FilesServiceClient } from '@/infrastructure/external';
import { VirtualPath } from '@/domain/value-objects';

/**
 * Use case: удаление всех файлов по префиксу пути (документ и все слайсы)
 */
export class DeleteByPathUseCase {
  constructor(private readonly filesServiceClient: FilesServiceClient) {}

  async execute(path: string): Promise<void> {
    // Валидируем путь
    const virtualPath = VirtualPath.create(path);

    // Удаляем все файлы с этим префиксом
    await this.filesServiceClient.deleteFilesByPath(virtualPath.toString());
  }
}
