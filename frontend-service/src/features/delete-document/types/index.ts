/** Результат удаления документа */
export interface UseDeleteDocumentResult {
  /** Флаг: идёт ли удаление */
  isDeleting: boolean;
  /** Ошибка удаления */
  error: string | null;
  /** Функция удаления документа по path */
  deleteDocument: (path: string) => Promise<void>;
}
