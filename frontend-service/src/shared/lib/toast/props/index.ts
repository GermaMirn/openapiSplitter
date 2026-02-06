import type { ToastMessageOptions } from 'primereact/toast';

export type ToastSeverity = ToastMessageOptions['severity'];

/** Опции для показа toast-уведомления */
export interface ToastShowOptions {
  /** Уровень важности */
  severity?: ToastSeverity;
  /** Заголовок сообщения */
  summary: string;
  /** Текст сообщения */
  detail?: string;
  /** Время показа в миллисекундах (по умолчанию 3000) */
  life?: number;
}

/** API контекста для работы с toast-уведомлениями */
export interface ToastContextValue {
  /** Показать уведомление с произвольными параметрами */
  show: (options: ToastShowOptions) => void;
  /** Показать уведомление об успехе */
  success: (summary: string, detail?: string, life?: number) => void;
  /** Показать уведомление об ошибке */
  error: (summary: string, detail?: string, life?: number) => void;
  /** Показать предупреждение */
  warn: (summary: string, detail?: string, life?: number) => void;
  /** Показать информационное уведомление */
  info: (summary: string, detail?: string, life?: number) => void;
}
