import { useState, useCallback } from 'react';
import { splitterApi } from '@/shared/api';
import type { UseDeleteDocumentResult } from '../types';

/**
 * Хук для удаления документа со всеми файлами по пути
 */
export function useDeleteDocument(): UseDeleteDocumentResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDocument = useCallback(async (path: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      await splitterApi.deleteByPath(path);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления документа';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    isDeleting,
    error,
    deleteDocument,
  };
}
