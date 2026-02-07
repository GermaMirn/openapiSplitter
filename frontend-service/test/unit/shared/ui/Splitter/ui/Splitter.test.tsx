import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { Splitter } from '@/shared/ui/Splitter';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>{children}</PrimeReactProvider>
);

describe('Splitter', () => {
  it('рендерит левую и правую панели', () => {
    render(
      <Splitter
        left={<div>Left Panel</div>}
        right={<div>Right Panel</div>}
      />,
      { wrapper }
    );

    expect(screen.getByText('Left Panel')).toBeInTheDocument();
    expect(screen.getByText('Right Panel')).toBeInTheDocument();
  });

  it('применяет кастомные размеры', () => {
    const { container } = render(
      <Splitter
        left={<div>Left</div>}
        right={<div>Right</div>}
        leftSize={40}
        leftMinSize={20}
      />,
      { wrapper }
    );

    expect(container.querySelector('.p-splitter')).toBeInTheDocument();
  });

  it('применяет кастомную высоту', () => {
    const { container } = render(
      <Splitter
        left={<div>Left</div>}
        right={<div>Right</div>}
        height="500px"
      />,
      { wrapper }
    );

    const splitter = container.querySelector('.p-splitter') as HTMLElement;
    expect(splitter.style.height).toBe('500px');
  });

  it('применяет className', () => {
    const { container } = render(
      <Splitter
        left={<div>Left</div>}
        right={<div>Right</div>}
        className="custom-class"
      />,
      { wrapper }
    );

    const splitter = container.querySelector('.p-splitter');
    expect(splitter?.className).toContain('custom-class');
  });
});
