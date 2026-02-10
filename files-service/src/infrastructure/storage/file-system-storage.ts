import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { IFileStorage } from '@/domain/interfaces';
import type { FilePath } from '@/domain/value-objects';
import { config } from '@/shared/config/config';

/**
 * Реализация IFileStorage: хранение файлов на диске в директории config.storage.path.
 */
export class FileSystemStorage implements IFileStorage {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? config.storage.path;
  }

  private resolvePath(filePath: FilePath): string {
    return path.join(this.baseDir, filePath.toString());
  }

  async save(filePath: FilePath, content: Buffer): Promise<void> {
    const absolutePath = this.resolvePath(filePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
  }

  async read(filePath: FilePath): Promise<Buffer> {
    const absolutePath = this.resolvePath(filePath);
    return readFile(absolutePath);
  }

  async delete(filePath: FilePath): Promise<void> {
    const absolutePath = this.resolvePath(filePath);
    await unlink(absolutePath);
  }
}
