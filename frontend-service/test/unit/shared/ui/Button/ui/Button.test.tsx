import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { Button } from '@/shared/ui/Button';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>{children}</PrimeReactProvider>
);

describe('Button', () => {
  it('рендерит кнопку с label', () => {
    render(<Button label="Click me" />, { wrapper });
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('вызывает onClick при клике', () => {
    const onClick = vi.fn();
    render(<Button label="Test" onClick={onClick} />, { wrapper });
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('отключается при disabled', () => {
    render(<Button label="Disabled" disabled />, { wrapper });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('применяет className', () => {
    render(<Button label="Custom" className="my-class" />, { wrapper });
    const button = screen.getByRole('button');
    expect(button).toHaveClass('my-class');
  });
});
