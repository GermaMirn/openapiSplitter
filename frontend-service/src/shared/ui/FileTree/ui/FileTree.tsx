import React from 'react';
import { Tree as PrimeTree } from 'primereact/tree';
import { findNodeByKey } from '../lib/find-node-by-key';
import type { FileTreeProps } from '../props';

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  selectedKey,
  onSelect,
  className = '',
}) => {
  const handleSelectionChange = (e: { value: string | null }) => {
    const key = typeof e.value === 'string' ? e.value : null;
    const node = key ? findNodeByKey(nodes, key) : null;
    onSelect(key, node);
  };

  return (
    <PrimeTree
      value={nodes}
      selectionMode="single"
      selectionKeys={selectedKey ?? undefined}
      onSelectionChange={(e) => handleSelectionChange(e as { value: string | null })}
      className={className}
    />
  );
};
