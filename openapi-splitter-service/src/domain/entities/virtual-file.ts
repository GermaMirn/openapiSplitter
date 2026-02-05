import type { VirtualPath } from '@/domain/value-objects';

/**
 * Виртуальный файл — результат разрезки OpenAPI спецификации
 */
export class VirtualFile {
  constructor(
    public readonly path: VirtualPath,
    public readonly content: string,
    public readonly isRoot: boolean = false
  ) {}

  static create(path: VirtualPath, content: string, isRoot: boolean = false): VirtualFile {
    return new VirtualFile(path, content, isRoot);
  }

  get size(): number {
    return Buffer.byteLength(this.content, 'utf-8');
  }
}
