import React from 'react';
import type { LoaderProps } from '../props';

export const Loader: React.FC<LoaderProps> = ({ text, className = '' }) => {
  return (
    <div
      className={`flex flex-1 min-h-0 flex-col items-center justify-center p-8 ${className}`}
      role="status"
      aria-label="Загрузка"
    >
      <div className="loader-ring" />
      {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
    </div>
  );
};
