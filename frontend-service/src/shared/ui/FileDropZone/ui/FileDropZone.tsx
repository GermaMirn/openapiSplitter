import React, { useRef, useState } from 'react';
import { Button } from 'src/shared/ui/Button';
import type { FileDropZoneProps } from '../props';
import { DEFAULT_ACCEPT } from '../constants';

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  title = 'Загрузите данные',
  hint,
  buttonLabel = 'Выбрать файл',
  accept = DEFAULT_ACCEPT,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'yaml' && ext !== 'yml') return;
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}
        ${className}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden
      />
      <p className="text-lg font-medium text-gray-900 mb-1">{title}</p>
      {hint && <p className="text-sm text-gray-500 mb-4">{hint}</p>}
      {buttonLabel ? (
        <Button
          type="button"
          label={buttonLabel}
          icon="pi pi-upload"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        />
      ) : null}
    </div>
  );
};
