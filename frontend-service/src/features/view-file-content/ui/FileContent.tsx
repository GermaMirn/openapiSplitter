import React from 'react';
import type { TreeNode } from 'primereact/treenode';
import { useFileContent } from '../hook/use-file-content';
import { FileContentPreview } from './FileContentPreview';

export interface FileContentProps {
  selectedKey: string | null;
  nodes: TreeNode[];
  className?: string;
}

/** Публичный компонент фичи: просмотр содержимого выбранного файла. */
export const FileContent: React.FC<FileContentProps> = ({
  selectedKey,
  nodes,
  className = '',
}) => {
  const fileContent = useFileContent(selectedKey, nodes);
  return <FileContentPreview file={fileContent} className={className} />;
};
