import React from 'react';
import { Button as PrimeButton, ButtonProps as PrimeButtonProps } from 'primereact/button';

export interface ButtonProps extends PrimeButtonProps {
  // Можно расширить пропсы при необходимости
}

export const Button: React.FC<ButtonProps> = ({ className = '', ...props }) => {
  return (
    <PrimeButton
      className={className}
      {...props}
    />
  );
};
