import React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { ToastProvider } from '@/shared/lib/toast';
import { SplitterPage } from '@/pages/splitter';

export const App: React.FC = () => {
  return (
    <PrimeReactProvider>
      <ToastProvider>
        <SplitterPage />
      </ToastProvider>
    </PrimeReactProvider>
  );
};
