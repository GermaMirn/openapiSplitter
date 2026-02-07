import type { TreeNode } from '@/shared/types';

/**
 * Рекурсивно фильтрует дерево по поисковому запросу.
 * Включает узлы, чьё имя совпадает с запросом, или у которых есть совпадающие потомки.
 */
export function filterTreeByQuery(nodes: TreeNode[], query: string): TreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  function filter(nodesToFilter: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];
    for (const node of nodesToFilter) {
      const label = String(node.label ?? '').toLowerCase();
      const matches = label.includes(q);
      const filteredChildren = node.children ? filter(node.children) : undefined;
      const hasMatchingChildren = filteredChildren && filteredChildren.length > 0;

      if (matches || hasMatchingChildren) {
        result.push({
          ...node,
          children: filteredChildren?.length ? filteredChildren : node.children,
        });
      }
    }
    return result;
  }

  return filter(nodes);
}
