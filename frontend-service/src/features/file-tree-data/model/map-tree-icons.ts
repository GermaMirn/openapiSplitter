import type { TreeNode, TreeNodeType } from '@/shared/types';
import { NODE_TYPE_ICON } from '../constants';

/**
 * Добавляет иконки узлам дерева по типу
 */
export function addIconsToNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => {
    const type = node.data?.type ?? ('folder' as TreeNodeType);
    const icon = NODE_TYPE_ICON[type];
    return {
      ...node,
      icon,
      children: node.children ? addIconsToNodes(node.children) : undefined,
    };
  });
}
