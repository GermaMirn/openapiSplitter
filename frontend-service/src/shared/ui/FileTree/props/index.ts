import type { TreeNode } from 'primereact/treenode';

export interface FileTreeProps {
  /** Дерево узлов (папки и файлы) в формате PrimeReact TreeNode */
  nodes: TreeNode[];
  /** Ключ выбранного узла (для подсветки) */
  selectedKey: string | null;
  /** Вызов при выборе узла. key = null при снятии выбора */
  onSelect: (key: string | null, node: TreeNode | null) => void;
  /** Дополнительный класс контейнера */
  className?: string;
}
