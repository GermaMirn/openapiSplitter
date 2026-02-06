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
  className?: string;
}
