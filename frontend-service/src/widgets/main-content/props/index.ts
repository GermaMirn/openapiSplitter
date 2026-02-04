import type { TreeNode } from 'primereact/treenode';

export interface MainContentProps {
  /** Документ уже загружен — показываем контент; иначе — зона загрузки */
  hasUploaded: boolean;
  /** Файл выбран, ждёт подтверждения (предпросмотр) */
  pendingFile: File | null;
  /** Обработчик выбора файла (показ предпросмотра) */
  onFileSelect: (file: File) => void;
  /** Подтвердить загрузку файла (кнопка «Загрузить» в предпросмотре) */
  onConfirmUpload: () => void;
  /** Отменить предпросмотр (кнопка «Отменить») */
  onCancelPreview: () => void;
  /** Сброс загрузки (кнопка «Загрузить другой файл») */
  onResetUpload: () => void;
  /** Ключ выбранного узла дерева (для просмотра файла) */
  selectedKey: string | null;
  /** Узлы дерева (для фичи просмотра файла) */
  treeNodes: TreeNode[];
  className?: string;
}
