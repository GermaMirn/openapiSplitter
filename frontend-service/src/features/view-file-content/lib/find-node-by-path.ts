import type { TreeNode } from '@/shared/types';

/**
 * Рекурсивно ищет узел в дереве по path (node.data.path)
 */
export function findNodeByPath(nodes: TreeNode[], path: string): TreeNode | null {
  for (const node of nodes) {
    if (node.data?.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}
