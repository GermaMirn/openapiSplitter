import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { NotFoundPage } from '@/pages/not-found';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const NavigateWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <MemoryRouter>{children}</MemoryRouter>;

describe('NotFoundPage', () => {
  it('рендерит 404 и текст', () => {
    render(
      <NavigateWrapper>
        <NotFoundPage />
      </NavigateWrapper>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Страница не найдена')).toBeInTheDocument();
  });

  it('кнопка «На главную» вызывает navigate("/")', async () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);

    render(
      <NavigateWrapper>
        <NotFoundPage />
      </NavigateWrapper>
    );

    const button = screen.getByRole('button', { name: /на главную/i });
    fireEvent.click(button);

    expect(navigate).toHaveBeenCalledWith('/');
  });
});
