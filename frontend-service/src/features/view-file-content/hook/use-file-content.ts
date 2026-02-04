import { useMemo } from 'react';
import type { TreeNode } from 'primereact/treenode';
import { findNodeByKey } from '../lib/find-node-by-key';
import type { FileContentResult } from '../types';

/**
 * Хук: по выбранному ключу и дереву возвращает данные для просмотра файла.
 */
export function useFileContent(
  selectedKey: string | null,
  nodes: TreeNode[]
): FileContentResult | null {
  return useMemo(() => {
    if (!selectedKey) return null;
    const node = findNodeByKey(nodes, selectedKey);
    if (!node) return null;
    const label = String(node.label ?? '');
    const content =
      (node.data as { content?: string } | undefined)?.content ??
      `# ${label}\n# Ключ: ${selectedKey}\n# Содержимое будет подгружаться с бэкенда.\n`;
    return { key: selectedKey, label, content };
  }, [selectedKey, nodes]);
}
