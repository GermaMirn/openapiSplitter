import type { TreeNode } from '@/shared/types';

export interface FileTreeProps {
  /** Дерево узлов (папки и файлы) */
  nodes: TreeNode[];
  /** Ключ выбранного узла (для подсветки) */
  selectedKey: string | null;
  /** Вызов при выборе узла. key = null при снятии выбора */
  onSelect: (key: string | null, node: TreeNode | null) => void;
  /** Callback для удаления документа по path */
  onDocumentDelete?: (path: string) => void;
  /** Callback для экспорта документа по path */
  onDocumentExport?: (path: string) => void;
  /** Дополнительный класс контейнера */
  className?: string;
}
