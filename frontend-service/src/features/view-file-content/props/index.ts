import type { FileContentResult } from '../types';

export interface FileContentPreviewProps {
  /** Данные файла для отображения. Если null — показать подсказку. */
  file: FileContentResult | null;
  className?: string;
}
