/** Данные для отображения содержимого файла */
export interface FileContentResult {
  /** Имя/метка файла */
  label: string;
  /** Содержимое (YAML). Если нет — заглушка. */
  content: string;
  /** Ключ узла */
  key: string;
}

/** Результат загрузки содержимого файла */
export interface UseFileContentResult {
  /** Данные содержимого файла */
  data: FileContentResult | null;
  /** Флаг загрузки */
  isLoading: boolean;
  /** Ошибка загрузки */
  error: string | null;
}
