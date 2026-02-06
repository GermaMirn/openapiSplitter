import { useState, useCallback } from 'react';
import { splitterApi } from '@/shared/api';
import type { UseDeleteFileResult } from '../types';

/**
 * Хук для удаления файла по ID
 */
export function useDeleteFile(): UseDeleteFileResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFile = useCallback(async (fileId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      await splitterApi.deleteFile(fileId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления файла';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    isDeleting,
    error,
    deleteFile,
  };
}
