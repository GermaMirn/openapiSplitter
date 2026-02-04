import React from 'react';
import { Button as PrimeButton } from 'primereact/button';
import type { ButtonProps } from '../props';

export const Button: React.FC<ButtonProps> = ({ className = '', ...props }) => {
  return (
    <PrimeButton
      className={`px-4 py-2.5 ${className}`}
      {...props}
    />
  );
};
