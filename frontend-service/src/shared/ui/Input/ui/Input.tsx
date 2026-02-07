import React from 'react';
import { InputText } from 'primereact/inputtext';
import type { InputProps } from '../props';

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <InputText
      className={`w-full ${className}`}
      {...props}
    />
  );
};
