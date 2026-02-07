import type { TreeNode } from '@/shared/types';
import type { TreeExpandedKeys } from '@/shared/ui/FileTree/props';

export interface SidebarProps {
  treeNodes: TreeNode[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  /** Раскрытые узлы дерева (controlled) */
  expandedKeys?: TreeExpandedKeys;
  /** Вызов при раскрытии/сворачивании узла */
  onExpandedKeysChange?: (keys: TreeExpandedKeys) => void;
  isLoading?: boolean;
  /** Callback для открытия зоны загрузки файла */
  onOpenUpload: () => void;
  /** Перезагрузка дерева после изменений */
  refetch: () => Promise<void>;
  /** Callback после удаления документа (например, сброс выбора) */
  onDocumentDeleted?: () => void;
  className?: string;
}
