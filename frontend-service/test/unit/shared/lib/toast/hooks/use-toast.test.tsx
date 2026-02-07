import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ToastProvider } from '@/shared/lib/toast';
import { PrimeReactProvider } from 'primereact/api';
import { useToast } from '@/shared/lib/toast/hooks/use-toast';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>
    <ToastProvider>{children}</ToastProvider>
  </PrimeReactProvider>
);

describe('useToast', () => {
  it('возвращает toast методы из контекста', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    
    expect(result.current.success).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.warn).toBeDefined();
    expect(result.current.info).toBeDefined();
    expect(result.current.show).toBeDefined();
  });

  it('выбрасывает ошибку при использовании без провайдера', () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within ToastProvider');
  });
});
