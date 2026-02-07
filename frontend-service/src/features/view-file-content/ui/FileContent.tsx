import React from 'react';
import { useFileContent } from '../hook/use-file-content';
import { useDeleteFile } from '@/features/delete-file';
import { useToast } from '@/shared/lib/toast';
import { CodeViewer, Loader, Button } from '@/shared/ui';
import { findNodeByKey } from '../lib/find-node-by-key';
import { getBreadcrumbItems } from '../lib/get-breadcrumb-items';
import type { FileContentProps } from '../props';

export const FileContent: React.FC<FileContentProps> = ({
  selectedKey,
  nodes,
  onBreadcrumbSelect,
  onFileDeleted,
  onRefClick,
  scrollContainerRef,
  showBackButton = false,
  onBack,
  restoreScroll,
  onScrollRestored,
  className = '',
}) => {
  const { data, isLoading, error } = useFileContent(selectedKey, nodes);
  const { deleteFile, isDeleting } = useDeleteFile();
  const toast = useToast();

  const selectedNode = selectedKey ? findNodeByKey(nodes, selectedKey) : null;
  const fileId = selectedNode?.data?.fileId;
  const isDocument = selectedNode?.data?.type === 'document';

  const handleDelete = async () => {
    if (!fileId) {
      toast.error('Ошибка', 'ID файла не найден');
      return;
    }

    try {
      await deleteFile(fileId);
      toast.success('Файл удалён', 'Файл успешно удалён');
      onFileDeleted?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления файла';
      toast.error('Ошибка удаления', errorMessage);
    }
  };

  if (isLoading) {
    return <Loader text="Загрузка файла..." className={className} />;
  }

  if (error) {
    return (
      <div className={`p-4 text-red-600 ${className}`}>
        <p>Ошибка: {error}</p>
      </div>
    );
  }

  if (!data) {
    return <p className={`text-gray-500 ${className}`}>Выберите файл в дереве слева</p>;
  }

  const showDeleteButton = fileId && !isDocument;
  const breadcrumbs = selectedKey ? getBreadcrumbItems(nodes, selectedKey) : [];

  return (
    <div className={`flex flex-col h-full rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`}>
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <nav className="flex items-center gap-1.5 text-sm text-gray-700 min-w-0" aria-label="Хлебные крошки">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const handleClick = () => onBreadcrumbSelect?.(item.key);

            return (
              <React.Fragment key={item.key}>
                {index > 0 && <span className="text-gray-400 shrink-0">/</span>}
                {isLast ? (
                  <span className="font-medium truncate" title={item.label}>
                    {item.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleClick}
                    className="text-blue-600 hover:text-blue-700 hover:underline truncate max-w-[120px] sm:max-w-[180px]"
                    title={item.label}
                  >
                    {item.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        <CodeViewer
          content={data.content}
          language="yaml"
          className="flex-1 min-h-0"
          scrollContainerRef={scrollContainerRef}
          restoreScroll={restoreScroll}
          onScrollRestored={onScrollRestored}
          onRefClick={onRefClick}
        />
      </div>

      <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
        {showBackButton && onBack && (
          <Button
            label="Вернуться назад"
            onClick={onBack}
            severity="info"
            outlined
            className="mr-auto"
          />
        )}
        {showDeleteButton && (
          <Button
            label={isDeleting ? 'Удаление...' : 'Удалить файл'}
            icon={isDeleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'}
            onClick={handleDelete}
            severity="danger"
            outlined
            disabled={isDeleting}
          />
        )}
      </div>
    </div>
  );
};
