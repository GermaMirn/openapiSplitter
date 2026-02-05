import type { FilePath, FileId } from '@/domain/value-objects';

export class File {
  constructor(
    public readonly id: FileId,
    public readonly path: FilePath,
    public readonly originalName: string,
    public readonly size: number,
    public readonly mimeType: string | null,
    public readonly createdAt: Date
  ) {}

  static create(
    id: FileId,
    path: FilePath,
    originalName: string,
    size: number,
    mimeType: string | null
  ): File {
    return new File(id, path, originalName, size, mimeType, new Date());
  }
}
