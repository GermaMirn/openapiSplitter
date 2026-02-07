import type { TreeNode } from '@/shared/types';
import type { BreadcrumbItem } from '../types'
import { findNodeByKey } from './find-node-by-key';
import { getAncestorKeys } from './get-ancestor-keys';

/**
 * Возвращает массив хлебных крошек от корня до выбранного узла.
 */
export function getBreadcrumbItems(nodes: TreeNode[], selectedKey: string): BreadcrumbItem[] {
  const ancestorKeys = getAncestorKeys(nodes, selectedKey);
  const allKeys = [...ancestorKeys, selectedKey];

  return allKeys
    .map((key) => {
      const node = findNodeByKey(nodes, key);
      return node ? { key, label: String(node.label ?? key) } : null;
    })
    .filter((item): item is BreadcrumbItem => item !== null);
}
