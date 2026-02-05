import type { IFileRepository, IFileStorage } from '@/domain/interfaces';

/**
 * Use case удаления всех файлов по префиксу пути (слайс/виртуальная папка).
 * Сначала удаление метаданных из БД, затем содержимого из хранилища.
 */
export class DeleteFilesByPathPrefixUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(pathPrefix: string): Promise<void> {
    const files = await this.fileRepository.findManyByPathPrefix(pathPrefix);
    await this.fileRepository.deleteManyByPathPrefix(pathPrefix);
    await Promise.all(files.map((file) => this.fileStorage.delete(file.path)));
  }
}
