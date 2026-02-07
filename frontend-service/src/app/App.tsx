import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { ToastProvider } from '@/shared/lib/toast';
import { SplitterPage, NotFoundPage } from '@/pages';

export const App: React.FC = () => {
  return (
    <PrimeReactProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplitterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </PrimeReactProvider>
  );
};
