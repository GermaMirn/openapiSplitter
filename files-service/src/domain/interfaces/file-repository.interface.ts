import type { File } from '@/domain/entities';
import type { FileId, FilePath } from '@/domain/value-objects';

export interface IFileRepository {
  save(file: File): Promise<void>;
  findById(id: FileId): Promise<File | null>;
  findByPath(path: FilePath): Promise<File | null>;
  /** Все файлы в хранилище */
  findAll(): Promise<File[]>;
  /** Все файлы, путь которых начинается с prefix (для слайсов/папок) */
  findManyByPathPrefix(pathPrefix: string): Promise<File[]>;
  delete(id: FileId): Promise<void>;
  /** Удалить все файлы, путь которых начинается с pathPrefix */
  deleteManyByPathPrefix(pathPrefix: string): Promise<void>;
  /** Обновить размер файла */
  updateSize(id: string, size: number): Promise<void>;
}
