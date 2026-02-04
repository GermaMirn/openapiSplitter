import React from 'react';
import { PrimeReactProvider } from 'primereact/api';

export const App: React.FC = () => {
  return (
    <PrimeReactProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OpenAPI Splitter</h1>
          <p className="text-gray-600">Frontend service is running</p>
        </div>
      </div>
    </PrimeReactProvider>
  );
};
