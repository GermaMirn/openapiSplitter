/** Результат экспорта в ZIP */
export interface UseExportZipResult {
  /** Флаг: идёт ли экспорт */
  isExporting: boolean;
  /** Ошибка экспорта */
  error: string | null;
  /** Функция экспорта в ZIP */
  exportZip: (path: string) => Promise<void>;
}
