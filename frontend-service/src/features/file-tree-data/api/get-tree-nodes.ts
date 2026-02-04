import type { TreeNode } from 'primereact/treenode';
import { addIconsToNodes } from '../model/map-tree-icons';
import { MOCK_DOCUMENTS } from './mock-tree-nodes';

/**
 * Получение узлов дерева. Только запрос данных; без преобразований.
 * С бэка приходит filename + tree. Добавляем верхний слой filename в UI.
 * Пока мок; позже — запрос к splitter API.
 */
export function getTreeNodes(): TreeNode[] {
  const roots: TreeNode[] = MOCK_DOCUMENTS.map((doc) => ({
    key: doc.id,
    label: doc.filename,
    data: { type: 'document' as const },
    children: doc.tree as TreeNode[],
  }));
  return addIconsToNodes(roots);
}
