import React, { useRef } from 'react';
import { Menu } from 'primereact/menu';
import type { PopupMenuProps } from '../props';

export const PopupMenu: React.FC<PopupMenuProps> = ({
  items,
  trigger,
  title,
  className = '',
}) => {
  const menuRef = useRef<Menu>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    menuRef.current?.toggle(e);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`ml-auto p-1 hover:bg-gray-200 rounded transition-colors ${className}`}
        title={title}
      >
        {trigger}
      </button>
      <Menu ref={menuRef} model={items} popup />
    </>
  );
};
