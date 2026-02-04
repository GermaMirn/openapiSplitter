import type { TreeNode } from 'primereact/treenode';

export interface SidebarProps {
  treeNodes: TreeNode[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  className?: string;
}
