import React from 'react';
import { Tree as PrimeTree } from 'primereact/tree';
import type { TreeNode as PrimeTreeNode } from 'primereact/treenode';
import type { MenuItem } from 'primereact/menuitem';
import { findNodeByKey } from '../lib/find-node-by-key';
import { PopupMenu } from '@/shared/ui/PopupMenu';
import type { FileTreeProps } from '../props';
import type { TreeNode } from '@/shared/types';

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  selectedKey,
  onSelect,
  onDocumentDelete,
  onDocumentExport,
  className = '',
}) => {
  const handleSelectionChange = (e: { value: string | null }) => {
    const key = typeof e.value === 'string' ? e.value : null;
    // findNodeByKey возвращает TreeNode из shared/types
    const node = key ? (findNodeByKey(nodes, key) as TreeNode | null) : null;
    onSelect(key, node);
  };

  // Кастомный шаблон для узлов с type=document
  const nodeTemplate = (node: PrimeTreeNode) => {
    const treeNode = node as TreeNode;
    const isDocument = treeNode.data?.type === 'document';
    const path = treeNode.data?.path;

    // Для удаления и экспорта документа нужен базовый путь (например "test1")
    const documentBasePath = path ? path.split('/')[0] : undefined;

    const items: MenuItem[] =
      documentBasePath && onDocumentDelete && onDocumentExport
        ? [
            {
              label: 'Скачать архив',
              icon: 'pi pi-download',
              command: () => onDocumentExport(documentBasePath),
            },
            {
              label: 'Удалить',
              icon: 'pi pi-trash',
              command: () => onDocumentDelete(documentBasePath),
              className: 'text-red-600',
            },
          ]
        : [];

    return (
      <div className="flex items-center w-full">
        <span className="flex-1">{node.label}</span>
        {isDocument && items.length > 0 && (
          <PopupMenu
            items={items}
            trigger={<i className="pi pi-ellipsis-h text-gray-600" />}
            title="Действия"
          />
        )}
      </div>
    );
  };

  return (
    <PrimeTree
      value={nodes}
      selectionMode="single"
      selectionKeys={selectedKey ?? undefined}
      onSelectionChange={(e) => handleSelectionChange(e as { value: string | null })}
      nodeTemplate={nodeTemplate}
      className={className}
    />
  );
};
