import archiver from 'archiver';
import type { FilesServiceClient } from '@/infrastructure/external';
import { VirtualPath } from '@/domain/value-objects';
import { DomainException } from '@/domain/exceptions';
import { Readable } from 'stream';

/**
 * Use case: экспорт ZIP архива со всей структурой файлов по пути
 */
export class ExportZipUseCase {
  constructor(private readonly filesServiceClient: FilesServiceClient) {}

  async execute(path: string): Promise<Readable> {
    // Валидируем путь
    const virtualPath = VirtualPath.create(path);

    // Получаем все файлы по префиксу
    const files = await this.filesServiceClient.listFiles(virtualPath.toString());

    if (files.length === 0) {
      throw new DomainException(
        `No files found for path: ${path}`,
        'NO_FILES_FOUND',
        404
      );
    }

    // Создаём архив
    const archive = archiver('zip', {
      zlib: { level: 9 }, // максимальное сжатие
    });

    // Обработка ошибок архиватора
    archive.on('error', (err) => {
      throw new Error(`Archive creation failed: ${err.message}`);
    });

    // Добавляем файлы в архив
    for (const file of files) {
      try {
        const content = await this.filesServiceClient.getFileContent(file.id);
        
        // Получаем относительный путь от базового пути
        const relativePath = this.getRelativePath(virtualPath.toString(), file.path);
        
        // Добавляем файл в архив
        archive.append(content, { name: relativePath });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to add file ${file.path} to archive: ${message}`);
      }
    }

    // Финализируем архив
    await archive.finalize();

    return archive;
  }

  /**
   * Получает относительный путь от базового пути
   */
  private getRelativePath(basePath: string, fullPath: string): string {
    const basePrefix = basePath + '/';
    if (fullPath.startsWith(basePrefix)) {
      return fullPath.substring(basePrefix.length);
    }
    // Если базовый путь не является префиксом, возвращаем полный путь
    return fullPath;
  }
}
