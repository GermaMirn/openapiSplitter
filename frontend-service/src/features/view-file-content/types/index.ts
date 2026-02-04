/** Данные для отображения содержимого файла */
export interface FileContentResult {
  /** Имя/метка файла */
  label: string;
  /** Содержимое (YAML). Если нет — заглушка. */
  content: string;
  /** Ключ узла */
  key: string;
}
