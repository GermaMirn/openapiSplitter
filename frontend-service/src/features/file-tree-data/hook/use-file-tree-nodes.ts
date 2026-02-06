import { useState, useEffect, useCallback } from 'react';
import type { TreeNode } from '@/shared/types';
import { splitterApi } from '@/shared/api';
import { addIconsToNodes } from '../model/map-tree-icons';

export interface UseFileTreeNodesResult {
  /** Узлы дерева */
  nodes: TreeNode[];
  /** Флаг: идёт ли загрузка */
  isLoading: boolean;
  /** Ошибка загрузки */
  error: string | null;
  /** Перезагрузить дерево */
  refetch: () => Promise<void>;
}

/**
 * Хук для загрузки дерева файлов из API
 */
export function useFileTreeNodes(): UseFileTreeNodesResult {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tree = await splitterApi.getTree();
      const nodesWithIcons = addIconsToNodes(tree);
      setNodes(nodesWithIcons);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки дерева файлов';
      setError(errorMessage);
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return {
    nodes,
    isLoading,
    error,
    refetch: fetchTree,
  };
}
