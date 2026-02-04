import React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { SplitterPage } from 'src/pages/splitter';

export const App: React.FC = () => {
  return (
    <PrimeReactProvider>
      <SplitterPage />
    </PrimeReactProvider>
  );
};
