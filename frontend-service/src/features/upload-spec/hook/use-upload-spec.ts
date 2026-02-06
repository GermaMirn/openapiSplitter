import { useState, useCallback } from 'react';
import { splitterApi } from '@/shared/api';
import type { UseUploadSpecResult } from '../types';
import type { UploadYamlResponse } from '@/shared/types';

/**
 * Хук для загрузки и разрезки OpenAPI спецификации
 */
export function useUploadSpec(): UseUploadSpecResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UploadYamlResponse | null>(null);

  const uploadFile = useCallback(async (file: File, path?: string) => {
    setIsLoading(true);
    setError(null);

    // Даём React отрендерить loading state до начала запроса
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const result = await splitterApi.uploadYaml(file, path);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файла';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    uploadFile,
    reset,
  };
}
