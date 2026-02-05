/**
 * DTO файла (метаданные)
 */
export interface FileMetadataDto {
  id: string;
  path: string;
  originalName: string;
  size: number;
  mimeType: string | null;
  createdAt: string;
}

/**
 * DTO файла с содержимым
 */
export interface FileWithContentDto {
  metadata: FileMetadataDto;
  content: string;
}
