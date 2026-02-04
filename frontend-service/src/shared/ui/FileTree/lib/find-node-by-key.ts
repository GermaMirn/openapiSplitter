import type { TreeNode } from 'primereact/treenode';

export function findNodeByKey(nodes: TreeNode[] | undefined, key: string): TreeNode | null {
  if (!nodes) return null;
  for (const node of nodes) {
    const nodeKey = String(node.key ?? node.id ?? '');
    if (nodeKey === key) return node;
    const found = findNodeByKey(node.children, key);
    if (found) return found;
  }
  return null;
}
