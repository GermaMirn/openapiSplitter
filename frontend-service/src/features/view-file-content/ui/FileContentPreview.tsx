import React from 'react';
import { CodeViewer } from 'src/shared/ui/CodeViewer';
import type { FileContentPreviewProps } from '../props';

export const FileContentPreview: React.FC<FileContentPreviewProps> = ({ file, className = '' }) => {
  if (!file) {
    return (
      <p className={`text-gray-500 ${className}`}>Выберите файл в дереве слева</p>
    );
  }

  return (
    <div className={`flex flex-col h-full min-h-0 overflow-auto ${className}`}>
      <div className="text-sm text-gray-500 mb-2 shrink-0">{file.label}</div>
      <div className="flex-1 min-h-0 overflow-auto rounded border border-gray-200 bg-gray-50">
        <CodeViewer content={file.content} language="yaml" />
      </div>
    </div>
  );
};
