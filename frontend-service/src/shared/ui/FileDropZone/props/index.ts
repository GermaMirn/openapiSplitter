export interface FileDropZoneProps {
  /** Вызов при выборе файла (один файл) */
  onFileSelect: (file: File) => void;
  /** Текст над зоной. По умолчанию "Загрузите данные" */
  title?: string;
  /** Подсказка под заголовком */
  hint?: string;
  /** Текст на кнопке. По умолчанию "Выбрать файл" */
  buttonLabel?: string;
  /** Принимаемые расширения (например .yaml, .yml). По умолчанию только .yaml и .yml */
  accept?: string;
  /** Дополнительный класс контейнера */
  className?: string;
}
