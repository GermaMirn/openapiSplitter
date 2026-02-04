import type React from 'react';

export interface AppSplitterProps {
  /** Контент левой панели (дерево файлов) */
  left: React.ReactNode;
  /** Контент правой панели (просмотр файла) */
  right: React.ReactNode;
  /** Начальный размер левой панели в процентах (0–100). По умолчанию 30 */
  leftSize?: number;
  /** Минимальный размер левой панели в процентах. По умолчанию 15 */
  leftMinSize?: number;
  /** Высота контейнера. По умолчанию 100% */
  height?: string | number;
  /** Дополнительный класс на контейнер */
  className?: string;
}
