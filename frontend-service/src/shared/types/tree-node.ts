/**
 * Тип узла дерева файлов
*/
export type TreeNodeType = 'document' | 'schema' | 'security' | 'path' | 'folder' | 'file';

/**
 * Узел дерева файлов
*/
export interface TreeNode {
  /** Уникальный ключ узла */
  key: string;
  /** Отображаемое имя */
  label: string;
  /** Дополнительные данные узла */
  data?: {
    /** Тип узла */
    type: TreeNodeType;
    /** Путь к файлу */
    path?: string;
    /** ID файла в files-service */
    fileId?: string;
  };
  /** Дочерние узлы */
  children?: TreeNode[];
}
