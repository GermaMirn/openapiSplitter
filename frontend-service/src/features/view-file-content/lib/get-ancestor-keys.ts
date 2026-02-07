import type { TreeNode } from '@/shared/types';

/**
 * Возвращает ключи всех предков узла с targetKey (от корня к родителю),
 * чтобы можно было раскрыть дерево до этого узла.
 */
export function getAncestorKeys(nodes: TreeNode[], targetKey: string): string[] {
  function findPath(
    list: TreeNode[],
    key: string,
    path: string[] = []
  ): string[] | null {
    for (const node of list) {
      const nodeKey = String(node.key ?? '');
      if (nodeKey === targetKey) return path;
      if (node.children?.length) {
        const found = findPath(node.children, key, [...path, nodeKey]);
        if (found) return found;
      }
    }
    return null;
  }
  const path = findPath(nodes, targetKey);
  return path ?? [];
}
