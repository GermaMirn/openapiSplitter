import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-2 text-gray-600">Страница не найдена</p>
      <Button
        label="На главную"
        icon="pi pi-home"
        onClick={() => navigate('/')}
        className="mt-6"
      />
    </div>
  );
};
