import type { UploadYamlResponse } from '@/shared/types';

export interface UseUploadSpecResult {
  /** Флаг: идёт ли загрузка */
  isLoading: boolean;
  /** Ошибка загрузки */
  error: string | null;
  /** Результат загрузки */
  data: UploadYamlResponse | null;
  /** Функция загрузки файла */
  uploadFile: (file: File, path?: string) => Promise<UploadYamlResponse>;
  /** Сброс состояния */
  reset: () => void;
}
