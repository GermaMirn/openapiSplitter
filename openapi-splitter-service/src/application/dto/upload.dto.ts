import type { TreeNode } from '@/shared/types';

/**
 * Входные данные для загрузки YAML спецификации
 */
export interface UploadYamlInput {
  /** Содержимое YAML файла (строка) */
  content?: string;
  /** Или буфер файла */
  buffer?: Buffer;
  /** Опциональный путь для сохранения (если не указан, используем имя файла) */
  path?: string;
  /** Имя файла */
  originalName: string;
}

/**
 * Метаданные корневого файла после загрузки
 */
export interface RootFileMetadata {
  id: string;
  path: string;
  originalName: string;
  size: number;
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
