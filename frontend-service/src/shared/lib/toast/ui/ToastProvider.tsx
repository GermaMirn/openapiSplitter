import React, { createContext, useCallback, useRef } from 'react';
import { Toast } from 'primereact/toast';
import type { ToastContextValue, ToastShowOptions } from '../props';

export const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastRef = useRef<Toast>(null);

  const show = useCallback((options: ToastShowOptions) => {
    toastRef.current?.show({
      severity: options.severity ?? 'info',
      summary: options.summary,
      detail: options.detail,
      life: options.life ?? 3000,
    });
  }, []);

  const success = useCallback(
    (summary: string, detail?: string, life?: number) => show({ severity: 'success', summary, detail, life }),
    [show]
  );

  const error = useCallback(
    (summary: string, detail?: string, life?: number) => show({ severity: 'error', summary, detail, life }),
    [show]
  );

  const warn = useCallback(
    (summary: string, detail?: string, life?: number) => show({ severity: 'warn', summary, detail, life }),
    [show]
  );

  const info = useCallback(
    (summary: string, detail?: string, life?: number) => show({ severity: 'info', summary, detail, life }),
    [show]
  );

  const value: ToastContextValue = { show, success, error, warn, info };

  return (
    <ToastContext.Provider value={value}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
};
