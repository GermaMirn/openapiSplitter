import type { TreeNode } from '@/shared/types';

/**
 * Минимальный контракт файла для построения дерева.
 */
export interface TreeBuildableFile {
  id: string;
  path: string;
}

/**
 * Порт для построения дерева файлов из плоского списка.
 */
export interface ITreeBuilder {
  buildTree(files: TreeBuildableFile[], originalFileName?: string): TreeNode[];
}
