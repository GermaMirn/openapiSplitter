import type { TreeNode } from 'primereact/treenode';
import { NODE_TYPE_ICON } from '../constants';
import type { TreeNodeType } from '../types';

/** Добавляет иконки узлам по data.type. Вызывается при отдаче данных в UI. */
export function addIconsToNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => {
    const type = (node.data as { type?: TreeNodeType } | undefined)?.type ?? 'folder';
    const icon = NODE_TYPE_ICON[type];
    return {
      ...node,
      icon,
      children: node.children ? addIconsToNodes(node.children) : undefined,
    };
  });
}
