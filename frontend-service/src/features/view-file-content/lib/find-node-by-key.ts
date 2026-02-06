import type { TreeNode } from '@/shared/types';

/**
 * Рекурсивно ищет узел в дереве по ключу
 */
export function findNodeByKey(nodes: TreeNode[] | undefined, key: string): TreeNode | null {
  if (!nodes) return null;

  for (const node of nodes) {
    if (node.key === key) return node;

    const found = findNodeByKey(node.children, key);
    if (found) return found;
  }
  return null;
}
