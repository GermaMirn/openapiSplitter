import React, { useRef } from 'react';
import { useFileContent } from '../hook/use-file-content';
import { useDeleteFile } from '@/features/delete-file';
import { useClickableYamlRefs } from '../hook/use-clickable-yaml-refs';
import { useToast } from '@/shared/lib/toast';
import { CodeViewer, Loader, Button } from '@/shared/ui';
import { findNodeByKey } from '../lib/find-node-by-key';
import type { FileContentProps } from '../props';

export const FileContent: React.FC<FileContentProps> = ({
  selectedKey,
  nodes,
  onFileDeleted,
  onRefClick,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error } = useFileContent(selectedKey, nodes);
  const { deleteFile, isDeleting } = useDeleteFile();
  const toast = useToast();

  useClickableYamlRefs(containerRef, data?.content ?? '', onRefClick, !!onRefClick);

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

  return (
    <div className={`flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`}>
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <p className="text-sm font-medium text-gray-700 truncate" title={data.label}>
          {data.label}
        </p>
      </div>

      <div ref={containerRef} className="flex flex-1 min-h-0 flex-col overflow-auto p-4">
        <CodeViewer content={data.content} language="yaml" className="rounded" />
      </div>

      {showDeleteButton && (
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
          <Button
            label={isDeleting ? 'Удаление...' : 'Удалить файл'}
            icon={isDeleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'}
            onClick={handleDelete}
            severity="danger"
            outlined
            disabled={isDeleting}
          />
        </div>
      )}
    </div>
  );
};
