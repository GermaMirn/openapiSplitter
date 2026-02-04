import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'src/shared/ui/Button';
import { CodeViewer } from 'src/shared/ui/CodeViewer';
import { Loader } from 'src/shared/ui/Loader';
import { MAX_FILE_SIZE_BYTES } from '../constants';
import { formatFileSize } from '../lib/format-file-size';
import { validateYamlContent } from '../lib/validate-yaml-content';
import type { FilePreviewProps } from '../props';

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onConfirm,
  onCancel,
  className = '',
}) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => {
    if (content === null || error) return { valid: false, error: undefined };
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: `Файл слишком большой. Максимум 10 МБ` };
    }
    return validateYamlContent(content);
  }, [content, error, file.size]);

  const canSubmit = validation.valid;

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setContent(reader.result as string);
    reader.onerror = () => setError('Не удалось прочитать файл');
    reader.readAsText(file, 'utf-8');
  }, [file]);

  return (
    <div
      className={`flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`}
    >
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>
      <div className="flex flex-1 min-h-0 flex-col overflow-auto p-4">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {!validation.valid && content !== null && !error && validation.error && (
          <p className="text-sm text-red-600 mb-2">{validation.error}</p>
        )}
        {content !== null && !error && (
          <CodeViewer content={content} language="yaml" className="rounded" />
        )}
        {content === null && !error && <Loader />}
      </div>
      <div className="flex justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
        <Button
          label="Загрузить"
          icon="pi pi-check"
          onClick={onConfirm}
          severity="success"
          disabled={!canSubmit}
        />
        <Button
          label="Отменить"
          icon="pi pi-times"
          onClick={onCancel}
          severity="danger"
          outlined
        />
      </div>
    </div>
  );
};
