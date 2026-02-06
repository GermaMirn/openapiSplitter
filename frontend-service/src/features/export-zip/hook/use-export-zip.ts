import { useState, useCallback } from 'react';
import { splitterApi } from '@/shared/api';
import type { UseExportZipResult } from '../types';

/**
 * Хук для экспорта документа в ZIP
 */
export function useExportZip(): UseExportZipResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportZip = useCallback(async (path: string) => {
    setIsExporting(true);
    setError(null);

    try {
      const blob = await splitterApi.exportZip(path);

      // Создаём ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${path.replace(/\//g, '-')}.zip`;
      document.body.appendChild(link);
      link.click();

      // Очищаем
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка экспорта ZIP';
      setError(errorMessage);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    error,
    exportZip,
  };
}
