import type { VirtualFile } from './virtual-file';
import type { VirtualPath, OpenApiVersion } from '@/domain/value-objects';

/**
 * Результат разрезки OpenAPI спецификации
 */
export class SplitResult {
  constructor(
    public readonly basePath: VirtualPath,
    public readonly version: OpenApiVersion,
    public readonly files: VirtualFile[]
  ) {}

  static create(basePath: VirtualPath, version: OpenApiVersion, files: VirtualFile[]): SplitResult {
    return new SplitResult(basePath, version, files);
  }

  /**
   * Получить корневой файл
   */
  getRootFile(): VirtualFile | undefined {
    return this.files.find((f) => f.isRoot);
  }

  /**
   * Получить файл по пути
   */
  getFileByPath(path: VirtualPath): VirtualFile | undefined {
    return this.files.find((f) => f.path.equals(path));
  }

  /**
   * Получить словарь путь -> содержимое
   */
  toFilesMap(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const file of this.files) {
      map[file.path.toString()] = file.content;
    }
    return map;
  }
}
