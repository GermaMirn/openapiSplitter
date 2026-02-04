import React from 'react';
import { Button, FileDropZone, FilePreview } from 'src/shared/ui';
import { FileContent } from 'src/features/view-file-content';
import type { MainContentProps } from '../props';

export const MainContent: React.FC<MainContentProps> = ({
  hasUploaded,
  pendingFile,
  onFileSelect,
  onConfirmUpload,
  onCancelPreview,
  onResetUpload,
  selectedKey,
  treeNodes,
  className = '',
}) => {
  if (!hasUploaded) {
    if (pendingFile) {
      return (
        <div className={`flex flex-col h-full min-h-0 ${className}`}>
          <FilePreview
            file={pendingFile}
            onConfirm={onConfirmUpload}
            onCancel={onCancelPreview}
            className="flex-1 min-h-0"
          />
        </div>
      );
    }
    return (
      <div className={`flex flex-col h-full min-h-0 ${className}`}>
        <FileDropZone
          onFileSelect={onFileSelect}
          title="Загрузите OpenAPI спецификацию"
          hint="Перетащите .yaml файл сюда или нажмите в любом месте зоны"
          buttonLabel=""
          className="flex-1 min-h-0 flex flex-col justify-center"
        />
      </div>
    );
  }

  return (
    <div className={`p-4 h-full flex flex-col min-h-0 ${className}`}>
      <div className="mb-4 flex items-center gap-2 shrink-0">
        <span className="text-sm text-gray-600">Документ загружен.</span>
        <Button
          label="Загрузить другой файл"
          link
          onClick={onResetUpload}
          className="text-sm p-0"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <FileContent selectedKey={selectedKey} nodes={treeNodes} />
      </div>
    </div>
  );
};
