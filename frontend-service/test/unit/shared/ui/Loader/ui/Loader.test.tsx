import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from '@/shared/ui/Loader';

describe('Loader', () => {
  it('рендерит loader-ring', () => {
    render(<Loader />);
    expect(document.querySelector('.loader-ring')).toBeInTheDocument();
  });

  it('рендерит текст при переданном text', () => {
    render(<Loader text="Загрузка..." />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('не рендерит текст без prop text', () => {
    render(<Loader />);
    expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
  });

  it('имеет role="status" и aria-label', () => {
    render(<Loader />);
    const el = screen.getByRole('status', { name: 'Загрузка' });
    expect(el).toBeInTheDocument();
  });

  it('применяет className', () => {
    render(<Loader className="custom" />);
    const el = screen.getByRole('status');
    expect(el).toHaveClass('custom');
  });
});
