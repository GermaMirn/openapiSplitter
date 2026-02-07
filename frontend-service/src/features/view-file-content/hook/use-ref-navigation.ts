import { useCallback } from 'react';
import { useToast } from '@/shared/lib/toast';
import type { TreeNode } from '@/shared/types';
import type { TreeExpandedKeys } from '@/shared/ui/FileTree/props'
import { findNodeByKey } from '../lib/find-node-by-key';
import { findNodeByPath } from '../lib/find-node-by-path';
import { getAncestorKeys } from '../lib/get-ancestor-keys';

/**
 * Хук для навигации по $ref при клике на путь в YAML.
 */
export function useRefNavigation(
  nodes: TreeNode[],
  selectedKey: string | null,
  setSelectedKey: (key: string | null) => void,
  setExpandedKeys: (keys: TreeExpandedKeys | ((prev: TreeExpandedKeys) => TreeExpandedKeys)) => void
): (refPath: string) => void {
  const toast = useToast();

  return useCallback(
    (refPath: string) => {
      const currentNode = selectedKey ? findNodeByKey(nodes, selectedKey) : null;
      if (!currentNode?.data?.path) {
        toast.error('Ошибка', 'Не удалось определить базовый путь документа');
        return;
      }

      const currentDir = currentNode.data.path.substring(0, currentNode.data.path.lastIndexOf('/'));
      const cleanRefPath = refPath.startsWith('./') ? refPath.substring(2) : refPath;

      // Формируем целевой путь относительно текущей директории
      const targetPath = currentDir ? `${currentDir}/${cleanRefPath}` : cleanRefPath;

      const targetNode = findNodeByPath(nodes, targetPath);
      if (targetNode) {
        const ancestorKeys = getAncestorKeys(nodes, String(targetNode.key));
        setExpandedKeys((prev) => {
          const next = { ...prev };
          ancestorKeys.forEach((k) => {
            next[k] = true;
          });
          return next;
        });
        setSelectedKey(targetNode.key);
        toast.info('Переход', `Открыт файл: ${refPath}`);
      } else {
        toast.error('Файл не найден', `Не удалось найти файл: ${targetPath}`);
      }
    },
    [nodes, selectedKey, setSelectedKey, setExpandedKeys, toast]
  );
}
