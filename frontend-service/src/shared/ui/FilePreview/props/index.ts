export interface FilePreviewProps {
  /** Файл для предпросмотра */
  file: File;
  /** Вызов при подтверждении (кнопка «Загрузить») */
  onConfirm: () => void;
  /** Вызов при отмене (кнопка «Отменить») */
  onCancel: () => void;
  /** Блокировка кнопок */
  disabled?: boolean;
  /** Дополнительный класс контейнера */
  className?: string;
}
