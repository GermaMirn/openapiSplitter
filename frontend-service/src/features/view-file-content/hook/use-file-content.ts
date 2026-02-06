import { useState, useEffect } from 'react';
import type { TreeNode } from '@/shared/types';
import { splitterApi } from '@/shared/api';
import { findNodeByKey } from '../lib/find-node-by-key';
import type { FileContentResult, UseFileContentResult } from '../types';

/**
 * Хук для загрузки содержимого файла по выбранному ключу узла
 */
export function useFileContent(selectedKey: string | null, nodes: TreeNode[]): UseFileContentResult {
  const [data, setData] = useState<FileContentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedKey) {
      setData(null);
      setError(null);
      return;
    }

    const node = findNodeByKey(nodes, selectedKey);
    if (!node) {
      setData(null);
      setError('Узел не найден');
      return;
    }

    const fileId = node.data?.fileId;
    if (!fileId) {
      // Если это папка или узел без fileId, показываем заглушку
      setData({
        key: selectedKey,
        label: node.label,
        content: `# ${node.label}\n# Нет содержимого для отображения`,
      });
      setError(null);
      return;
    }

    // Загружаем содержимое файла
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fileData = await splitterApi.getFileContent(fileId);
        setData({
          key: selectedKey,
          label: node.label,
          content: fileData.content,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файла';
        setError(errorMessage);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [selectedKey, nodes]);

  return {
    data,
    isLoading,
    error,
  };
}
