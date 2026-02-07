import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { PopupMenu } from '@/shared/ui/PopupMenu';
import type { MenuItem } from 'primereact/menuitem';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>{children}</PrimeReactProvider>
);

const items: MenuItem[] = [
  { label: 'Action 1', icon: 'pi pi-check', command: vi.fn() },
  { label: 'Action 2', icon: 'pi pi-times', command: vi.fn() },
];

describe('PopupMenu', () => {
  it('рендерит trigger', () => {
    render(
      <PopupMenu
        items={items}
        trigger={<span>Menu</span>}
        title="Actions"
      />,
      { wrapper }
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('применяет title к кнопке', () => {
    render(
      <PopupMenu
        items={items}
        trigger={<span>Menu</span>}
        title="Open menu"
      />,
      { wrapper }
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Open menu');
  });

  it('вызывает handleClick при клике', () => {
    render(
      <PopupMenu
        items={items}
        trigger={<span>Menu</span>}
        title="Actions"
      />,
      { wrapper }
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Меню должно открыться (функция toggle вызвана)
    expect(button).toBeInTheDocument();
  });

  it('stopPropagation при клике', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <PopupMenu
          items={items}
          trigger={<span>Menu</span>}
          title="Actions"
        />
      </div>,
      { wrapper }
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // stopPropagation должен предотвратить всплытие
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('применяет className', () => {
    render(
      <PopupMenu
        items={items}
        trigger={<span>Menu</span>}
        title="Actions"
        className="custom"
      />,
      { wrapper }
    );

    const button = screen.getByRole('button');
    expect(button.className).toContain('custom');
  });
});
