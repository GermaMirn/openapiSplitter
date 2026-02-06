export interface InlineMessageProps {
  /** Текст сообщения */
  message: string;
  /** Тип (severity) — error, warn, info, success */
  severity?: 'error' | 'warn' | 'info' | 'success';
  /** Дополнительный класс контейнера */
  className?: string;
}
