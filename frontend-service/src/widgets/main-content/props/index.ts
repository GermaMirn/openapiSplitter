import type { TreeNode } from '@/shared/types';

export interface MainContentProps {
  /** Показать зону загрузки файла */
  showUploadZone: boolean;
  /** Файл выбран, ждёт подтверждения (предпросмотр) */
  pendingFile: File | null;
  /** Обработчик выбора файла (показ предпросмотра) */
  onFileSelect: (file: File) => void;
  /** Подтвердить загрузку файла (кнопка «Загрузить» в предпросмотре) */
  onConfirmUpload: () => void;
  /** Отменить предпросмотр (кнопка «Отменить») */
  onCancelPreview: () => void;
  /** Ключ выбранного узла дерева (для просмотра файла) */
  selectedKey: string | null;
  /** Узлы дерева (для фичи просмотра файла) */
  treeNodes: TreeNode[];
  /** Флаг: идёт ли загрузка файла */
  isUploading?: boolean;
  /** Callback после удаления файла */
  onFileDeleted?: () => void;
  /** Callback при клике на $ref */
  onRefClick?: (refPath: string) => void;
  /** Ref на контейнер скролла (для сохранения позиции при переходе по $ref) */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  /** Показывать кнопку «Назад» (после перехода по $ref) */
  showBackButton?: boolean;
  /** Callback кнопки «Назад» */
  onBack?: () => void;
  /** Восстановить скролл после возврата (значение scrollTop) */
  restoreScroll?: number | null;
  /** Вызов после восстановления скролла */
  onScrollRestored?: () => void;
  className?: string;
}
