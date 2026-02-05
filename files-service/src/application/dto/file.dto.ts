/**
 * Входные данные для загрузки файла
*/
export interface UploadFileInput {
  /** Содержимое файла в виде байтов */
  buffer: Buffer;
  /** Виртуальный путь к файлу */
  path: string;
  /** Исходное имя файла (например из multipart) */
  originalName: string;
  /** MIME-тип файла. Опционально */
  mimeType?: string | null;
}

/**
 * Данные о файле для возврата клиенту
*/
export interface FileDto {
  /** Уникальный идентификатор файла (UUID) */
  id: string;
  /** Виртуальный путь к файлу */
  path: string;
  /** Исходное имя файла */
  originalName: string;
  /** Размер файла в байтах */
  size: number;
  /** MIME-тип файла или null */
  mimeType: string | null;
  /** Дата создания файла в формате ISO */
  createdAt: string;
}

/**
 * Преобразует доменную сущность File в FileDto
 */
export function fileToDto(file: { id: { toString(): string }; path: { toString(): string }; originalName: string; size: number; mimeType: string | null; createdAt: Date }): FileDto {
  return {
    id: file.id.toString(),
    path: file.path.toString(),
    originalName: file.originalName,
    size: file.size,
    mimeType: file.mimeType,
    createdAt: file.createdAt.toISOString(),
  };
}
