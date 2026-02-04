import { useState, useCallback } from 'react';
import type { UseUploadSpecResult } from '../types';

/** Хук: состояние загрузки спецификации (файл уже загружен или нет). */
export function useUploadSpec(): UseUploadSpecResult {
  const [hasUploaded, setHasUploaded] = useState(false);

  const handleFileSelect = useCallback(() => {
    setHasUploaded(true);
  }, []);

  const resetUpload = useCallback(() => {
    setHasUploaded(false);
  }, []);

  return { hasUploaded, handleFileSelect, resetUpload };
}
