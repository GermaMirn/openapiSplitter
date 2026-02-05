import type { IFileRepository } from '@/domain/interfaces';
import type { FileDto } from '@/application/dto';
import { fileToDto } from '@/application/dto';

export interface ListFilesInput {
  /** Если указан, возвращаются только файлы с путём, начинающимся с этого префикса (слайс/папка) */
  pathPrefix?: string;
}

/**
 * Use case получения списка файлов (все или по префиксу пути)
 */
export class ListFilesUseCase {
  constructor(private readonly fileRepository: IFileRepository) {}

  async execute(input: ListFilesInput = {}): Promise<FileDto[]> {
    const files = input.pathPrefix
      ? await this.fileRepository.findManyByPathPrefix(input.pathPrefix)
      : await this.fileRepository.findAll();

    return files.map(fileToDto);
  }
}
