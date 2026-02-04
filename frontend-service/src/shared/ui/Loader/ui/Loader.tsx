import React from 'react';
import type { LoaderProps } from '../props';

export const Loader: React.FC<LoaderProps> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-1 min-h-0 items-center justify-center p-8 ${className}`}
      role="status"
      aria-label="Загрузка"
    >
      <div className="loader-ring" />
    </div>
  );
};
