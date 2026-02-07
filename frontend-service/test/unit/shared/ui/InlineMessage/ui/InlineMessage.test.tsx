import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { InlineMessage } from '@/shared/ui/InlineMessage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>{children}</PrimeReactProvider>
);

describe('InlineMessage', () => {
  it('рендерит сообщение', () => {
    render(<InlineMessage message="Test message" severity="info" />, { wrapper });
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
