import type { TreeNode } from 'primereact/treenode';

/** Тип узла дерева. С бэка приходит tree с type у узлов. */
export type TreeNodeType = 'document' | 'schema' | 'security' | 'path' | 'folder';

/** Документ: filename — верхний слой (добавляем в UI), tree — split-структура. */
export interface DocumentItem {
  id: string;
  filename: string;
  tree: TreeNode[];
}
