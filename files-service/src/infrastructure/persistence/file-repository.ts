import type { IFileRepository } from '@/domain/interfaces';
import { File } from '@/domain/entities';
import { FilePath, FileId } from '@/domain/value-objects';
import { prisma } from '@/infrastructure/database';

/**
 * Реализация репозитория файлов через Prisma
*/
export class FileRepository implements IFileRepository {
  async save(file: File): Promise<void> {
    await prisma.file.upsert({
      where: { id: file.id.toString() },
      create: {
        id: file.id.toString(),
        path: file.path.toString(),
        original_name: file.originalName,
        size: BigInt(file.size),
        mime_type: file.mimeType,
        created_at: file.createdAt,
      },
      update: {
        path: file.path.toString(),
        original_name: file.originalName,
        size: BigInt(file.size),
        mime_type: file.mimeType,
      },
    });
  }

  async findById(id: FileId): Promise<File | null> {
    const row = await prisma.file.findUnique({
      where: { id: id.toString() },
    });
    if (!row) return null;
    return this.rowToFile(row);
  }

  async findByPath(path: FilePath): Promise<File | null> {
    const row = await prisma.file.findUnique({
      where: { path: path.toString() },
    });
    if (!row) return null;
    return this.rowToFile(row);
  }

  async findAll(): Promise<File[]> {
    const rows = await prisma.file.findMany({
      orderBy: { path: 'asc' },
    });
    return rows.map((row) => this.rowToFile(row));
  }

  async delete(id: FileId): Promise<void> {
    await prisma.file.deleteMany({
      where: { id: id.toString() },
    });
  }

  async findManyByPathPrefix(pathPrefix: string): Promise<File[]> {
    const prefixWithSlash = pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`;
    const rows = await prisma.file.findMany({
      where: {
        OR: [
          { path: { startsWith: prefixWithSlash } },
          ...(pathPrefix.endsWith('/') ? [] : [{ path: pathPrefix }]),
        ],
      },
      orderBy: { path: 'asc' },
    });
    return rows.map((row) => this.rowToFile(row));
  }

  async deleteManyByPathPrefix(pathPrefix: string): Promise<void> {
    const prefixWithSlash = pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`;
    await prisma.file.deleteMany({
      where: {
        OR: [
          { path: { startsWith: prefixWithSlash } },
          ...(pathPrefix.endsWith('/') ? [] : [{ path: pathPrefix }]),
        ],
      },
    });
  }

  private rowToFile(row: {
    id: string;
    path: string;
    original_name: string;
    size: bigint;
    mime_type: string | null;
    created_at: Date;
  }): File {
    return new File(
      FileId.fromString(row.id),
      FilePath.create(row.path),
      row.original_name,
      Number(row.size),
      row.mime_type,
      new Date(row.created_at)
    );
  }
}
