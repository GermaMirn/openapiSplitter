import React from 'react';
import { FileTree } from 'src/shared/ui';
import type { SidebarProps } from '../props';

export const Sidebar: React.FC<SidebarProps> = ({
  treeNodes,
  selectedKey,
  onSelect,
  className = '',
}) => {
  return (
    <aside
      className={`w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-gray-100 shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">OpenAPI Splitter</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-0">
        <FileTree
          nodes={treeNodes}
          selectedKey={selectedKey}
          onSelect={onSelect}
          className="p-0"
        />
      </div>
    </aside>
  );
};
