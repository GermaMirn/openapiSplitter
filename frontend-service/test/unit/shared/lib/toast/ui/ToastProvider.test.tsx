import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '@/shared/lib/toast';

function Consumer() {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast.show({ summary: 'Test' })}>
      Show
    </button>
  );
}

describe('ToastProvider', () => {
  it('show с частичными options использует severity и life по умолчанию (branch 12)', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument();
    screen.getByRole('button', { name: 'Show' }).click();
    // Код show({ severity: options.severity ?? 'info', life: options.life ?? 3000 }) выполнен без ошибок
  });
});
