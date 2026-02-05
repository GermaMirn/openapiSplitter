/**
 * Тип узла дерева
 */
export type TreeNodeType = 'document' | 'schema' | 'security' | 'path' | 'folder' | 'file';

/**
 * Узел дерева файлов
 */
export interface TreeNode {
  key: string;
  label: string;
  data?: {
    type: TreeNodeType;
    path?: string;
    fileId?: string;
  };
  children?: TreeNode[];
}
