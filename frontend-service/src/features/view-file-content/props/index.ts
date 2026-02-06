import type { TreeNode } from '@/shared/types';

export interface FileContentProps {
  selectedKey: string | null;
  nodes: TreeNode[];
  /** Callback после удаления файла */
  onFileDeleted?: () => void;
  /** Callback при клике на $ref для навигации */
  onRefClick?: (refPath: string) => void;
  className?: string;
}
