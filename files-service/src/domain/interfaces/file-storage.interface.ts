import type { FilePath } from '@/domain/value-objects';

export interface IFileStorage {
  save(path: FilePath, content: Buffer): Promise<void>;
  read(path: FilePath): Promise<Buffer>;
  delete(path: FilePath): Promise<void>;
}
