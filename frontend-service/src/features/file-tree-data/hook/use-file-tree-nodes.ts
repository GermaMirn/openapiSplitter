import { useMemo } from 'react';
import type { TreeNode } from 'primereact/treenode';
import { getTreeNodes } from '../api/get-tree-nodes';
import { addIconsToNodes } from '../model/map-tree-icons';

/**
 * Хук: возвращает узлы дерева для отображения.
 * Данные из api, преобразование (иконки) — при отдаче в UI.
 */
export function useFileTreeNodes(): TreeNode[] {
  return useMemo(() => addIconsToNodes(getTreeNodes()), []);
}
