import type { TreeNode } from '@/shared/types';

export interface FileContentProps {
  selectedKey: string | null;
  nodes: TreeNode[];
  /** Callback при клике на хлебную крошку (переход к узлу) */
  onBreadcrumbSelect?: (key: string) => void;
  /** Callback после удаления файла */
  onFileDeleted?: () => void;
  /** Callback при клике на $ref для навигации */
  onRefClick?: (refPath: string) => void;
  /** Ref на контейнер скролла (для сохранения позиции при переходе по $ref) */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  /** Показывать кнопку «Вернуться назад» */
  showBackButton?: boolean;
  /** Callback кнопки «Назад» */
  onBack?: () => void;
  /** Восстановить scrollTop после возврата */
  restoreScroll?: number | null;
  /** Вызов после восстановления скролла */
  onScrollRestored?: () => void;
  className?: string;
}
