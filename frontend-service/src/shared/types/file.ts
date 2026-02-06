/**
 * Метаданные файла
*/
export interface FileMetadata {
  /** ID файла */
  id: string;
  /** Путь к файлу */
  path: string;
  /** Оригинальное имя файла */
  originalName: string;
  /** Размер файла в байтах */
  size: number;
  /** MIME-тип */
  mimeType: string | null;
  /** Дата создания (ISO string) */
  createdAt: string;
}

/**
 * Файл с содержимым
*/
export interface FileWithContent {
  /** Метаданные файла */
  metadata: FileMetadata;
  /** Содержимое файла */
  content: string;
}
