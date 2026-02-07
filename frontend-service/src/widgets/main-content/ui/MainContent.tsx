import React from 'react';
import { FileDropZone, FilePreview } from '@/shared/ui';
import { FileContent } from '@/features/view-file-content';
import type { MainContentProps } from '../props';

export const MainContent: React.FC<MainContentProps> = ({
  showUploadZone,
  pendingFile,
  onFileSelect,
  onConfirmUpload,
  onCancelPreview,
  selectedKey,
  treeNodes,
  isUploading = false,
  onFileDeleted,
  onRefClick,
  scrollContainerRef,
  showBackButton = false,
  onBack,
  restoreScroll,
  onScrollRestored,
  className = '',
}) => {
  // Приоритет 1: Если выбран файл из дерева - показываем его
  if (selectedKey) {
    return (
      <div className={`flex flex-col h-full min-h-0 ${className}`}>
        <FileContent
          selectedKey={selectedKey}
          nodes={treeNodes}
          onFileDeleted={onFileDeleted}
          onRefClick={onRefClick}
          scrollContainerRef={scrollContainerRef}
          showBackButton={showBackButton}
          onBack={onBack}
          restoreScroll={restoreScroll}
          onScrollRestored={onScrollRestored}
        />
      </div>
    );
  }

  // Приоритет 2: Если показываем зону загрузки
  if (showUploadZone) {
    // Есть файл на предпросмотре
    if (pendingFile) {
      return (
        <div className={`flex flex-col h-full min-h-0 ${className}`}>
          <FilePreview
            file={pendingFile}
            onConfirm={onConfirmUpload}
            onCancel={onCancelPreview}
            className="flex-1 min-h-0"
            disabled={isUploading}
          />
        </div>
      );
    }

    // Показываем FileDropZone
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

  // Приоритет 3: Пустой экран (ничего не выбрано)
  return (
    <div className={`flex flex-col h-full min-h-0 items-center justify-center ${className}`}>
      <p className="text-gray-500 text-sm">Выберите файл из дерева или загрузите новый</p>
    </div>
  );
};
