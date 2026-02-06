import { useCallback } from 'react';
import { useToast } from '@/shared/lib/toast';
import { findNodeByKey } from '../lib/find-node-by-key';
import { findNodeByPath } from '../lib/find-node-by-path';
import type { TreeNode } from '@/shared/types';

/**
 * Хук для навигации по $ref при клике на путь в YAML.
 * Находит узел по относительному пути и переключает выделение.
 */
export function useRefNavigation(
  nodes: TreeNode[],
  selectedKey: string | null,
  setSelectedKey: (key: string | null) => void
): (refPath: string) => void {
  const toast = useToast();

  return useCallback(
    (refPath: string) => {
      const currentNode = selectedKey ? findNodeByKey(nodes, selectedKey) : null;
      if (!currentNode?.data?.path) {
        toast.error('Ошибка', 'Не удалось определить базовый путь документа');
        return;
      }

      const documentBasePath = currentNode.data.path.split('/')[0];
      const targetPath = `${documentBasePath}/${refPath}`;

      const targetNode = findNodeByPath(nodes, targetPath);
      if (targetNode) {
        setSelectedKey(targetNode.key);
        toast.info('Переход', `Открыт файл: ${refPath}`);
      } else {
        toast.error('Файл не найден', `Не удалось найти файл: ${refPath}`);
      }
    },
    [nodes, selectedKey, setSelectedKey, toast]
  );
}
