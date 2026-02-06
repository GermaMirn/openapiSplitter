import type { TreeNode } from '@/shared/types';

/**
 * Метаданные корневого файла после загрузки
*/
export interface RootFileMetadata {
  /** ID корневого файла */
  id: string;
  /** Путь к корневому файлу */
  path: string;
  /** Оригинальное имя файла */
  originalName: string;
  /** Размер файла в байтах */
  size: number;
  /** Дата создания (ISO string) */
  createdAt: string;
}

/**
 * Результат загрузки и разрезки YAML спецификации
*/
export interface UploadYamlResponse {
  /** Метаданные корневого файла */
  rootFile: RootFileMetadata;
  /** Дерево файлов для документа */
  tree: TreeNode[];
  /** Общее количество созданных файлов */
  totalFiles: number;
}
