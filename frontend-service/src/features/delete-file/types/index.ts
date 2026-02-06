/** Результат удаления файла */
export interface UseDeleteFileResult {
  /** Флаг: идёт ли удаление */
  isDeleting: boolean;
  /** Ошибка удаления */
  error: string | null;
  /** Функция удаления файла */
  deleteFile: (fileId: string) => Promise<void>;
}
