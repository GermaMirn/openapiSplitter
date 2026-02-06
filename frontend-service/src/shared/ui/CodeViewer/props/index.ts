export interface CodeViewerProps {
  /** Содержимое кода для отображения */
  content: string;
  /** Язык для подсветки синтаксиса */
  language?: string;
  /** Дополнительный класс контейнера */
  className?: string;
}
