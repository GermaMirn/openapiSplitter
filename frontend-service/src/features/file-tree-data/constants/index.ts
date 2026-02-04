import type { TreeNodeType } from '../types';

/** Маппинг тип узла → иконка (PrimeIcons). document + .yaml — pi pi-file. */
export const NODE_TYPE_ICON: Record<TreeNodeType, string> = {
  document: 'pi pi-file',
  schema: 'pi pi-file',
  security: 'pi pi-file',
  path: 'pi pi-file',
  folder: 'pi pi-folder',
};
