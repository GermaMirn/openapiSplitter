import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { Input } from '@/shared/ui/Input';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>{children}</PrimeReactProvider>
);

describe('Input', () => {
  it('рендерит input с placeholder', () => {
    render(<Input placeholder="Введите текст" />, { wrapper });
    expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument();
  });

  it('вызывает onChange при вводе', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />, { wrapper });
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('отображает value', () => {
    render(<Input value="hello" readOnly />, { wrapper });
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });
});
