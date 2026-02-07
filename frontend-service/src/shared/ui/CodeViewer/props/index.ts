export interface CodeViewerProps {
  /** Содержимое кода для отображения */
  content: string;
  /** Язык для подсветки синтаксиса */
  language?: string;
  /** Дополнительный класс контейнера */
  className?: string;
  /** Ref на контейнер скролла (для сохранения позиции «назад») */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  /** Восстановить scrollTop */
  restoreScroll?: number | null;
  /** Вызов после применения restoreScroll */
  onScrollRestored?: () => void;
  /** Обработчик клика по YAML-ссылке (./...yaml) */
  onRefClick?: (refPath: string) => void;
}
