import React, { useState, useMemo } from 'react';
import { FileTree, Loader, Button, Input } from '@/shared/ui';
import { filterTreeByQuery } from '@/shared/ui/FileTree/lib/filter-tree-by-query';
import { useDeleteDocument } from '@/features/delete-document';
import { useExportZip } from '@/features/export-zip';
import { useToast } from '@/shared/lib/toast';
import type { SidebarProps } from '../props';

export const Sidebar: React.FC<SidebarProps> = ({
  treeNodes,
  selectedKey,
  onSelect,
  expandedKeys,
  onExpandedKeysChange,
  isLoading = false,
  onOpenUpload,
  refetch,
  onDocumentDeleted,
  className = '',
}) => {
  const { deleteDocument } = useDeleteDocument();
  const { exportZip } = useExportZip();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const filteredNodes = useMemo(() => filterTreeByQuery(treeNodes, searchQuery), [treeNodes, searchQuery]);

  const handleDocumentDelete = async (path: string) => {
    try {
      await deleteDocument(path);
      toast.success('Документ удалён', 'Все файлы документа успешно удалены');
      onDocumentDeleted?.();
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления документа';
      toast.error('Ошибка удаления', errorMessage);
    }
  };

  const handleDocumentExport = async (path: string) => {
    try {
      await exportZip(path);
      toast.success('Архив загружен', 'ZIP-архив успешно скачан');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка экспорта';
      toast.error('Ошибка экспорта', errorMessage);
    }
  };

  return (
    <aside className={`w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100 shrink-0">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">OpenAPI Splitter</h1>
        <hr className="border-0 border-t border-gray-100 -mx-4 my-0" />
        <Button
          label="Загрузить файл"
          icon="pi pi-plus"
          onClick={onOpenUpload}
          className="w-full mt-3"
          size="small"
          severity='success'
          outlined
        />
        <div className="p-input-icon-left block mt-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value ?? '')}
            placeholder="Поиск по файлам..."
            className="w-full"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader text="Загрузка дерева..." />
          </div>
        ) : treeNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <p className="text-sm text-gray-500 text-center">Нет загруженных документов</p>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <p className="text-sm text-gray-500 text-center">Ничего не найдено</p>
          </div>
        ) : (
          <FileTree
            nodes={filteredNodes}
            selectedKey={selectedKey}
            onSelect={onSelect}
            expandedKeys={expandedKeys}
            onToggle={onExpandedKeysChange}
            onDocumentDelete={handleDocumentDelete}
            onDocumentExport={handleDocumentExport}
            className="p-0"
          />
        )}
      </div>
    </aside>
  );
};
