import type { TreeNode } from '@/shared/types';

export interface SidebarProps {
  treeNodes: TreeNode[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  isLoading?: boolean;
  /** Callback для открытия зоны загрузки файла */
  onOpenUpload: () => void;
  /** Перезагрузка дерева после изменений */
  refetch: () => Promise<void>;
  /** Callback после удаления документа (например, сброс выбора) */
  onDocumentDeleted?: () => void;
  className?: string;
}
