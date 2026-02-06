import type { MenuItem } from 'primereact/menuitem';

export interface PopupMenuProps {
  /** Пункты меню */
  items: MenuItem[];
  /** Содержимое кнопки-триггера (иконка, текст, "..." и т.д.) */
  trigger: React.ReactNode;
  /** Тултип для кнопки */
  title?: string;
  /** Дополнительный класс контейнера кнопки */
  className?: string;
}
