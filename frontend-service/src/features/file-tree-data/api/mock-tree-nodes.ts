import type { TreeNode } from 'primereact/treenode';
import type { TreeNodeType } from '../types';
import type { DocumentItem } from '../types';

/** Узел с type в data; icon фронт добавляет при подготовке дерева */
type NodeWithType = Omit<TreeNode, 'icon' | 'children'> & {
  data?: { type: TreeNodeType };
  children?: NodeWithType[];
};

/** Split-структура для doc-1: components + paths. */
const buildDoc1Tree = (): NodeWithType[] => [
  {
    key: 'doc-1:components',
    label: 'components',
    data: { type: 'folder' },
    children: [
      {
        key: 'doc-1:components/schemas',
        label: 'schemas',
        data: { type: 'folder' },
        children: [
          { key: 'doc-1:components/schemas/User.yaml', label: 'User.yaml', data: { type: 'schema' } },
          { key: 'doc-1:components/schemas/Admin.yaml', label: 'Admin.yaml', data: { type: 'schema' } },
          { key: 'doc-1:components/schemas/Error.yaml', label: 'Error.yaml', data: { type: 'schema' } },
        ],
      },
      {
        key: 'doc-1:components/securitySchemes',
        label: 'securitySchemes',
        data: { type: 'folder' },
        children: [
          { key: 'doc-1:components/securitySchemes/BearerAuth.yaml', label: 'BearerAuth.yaml', data: { type: 'security' } },
        ],
      },
    ],
  },
  {
    key: 'doc-1:paths',
    label: 'paths',
    data: { type: 'folder' },
    children: [
      {
        key: 'doc-1:paths/api',
        label: 'api',
        data: { type: 'folder' },
        children: [
          {
            key: 'doc-1:paths/api/v1',
            label: 'v1',
            data: { type: 'folder' },
            children: [
              { key: 'doc-1:paths/api/v1/users.yaml', label: 'users.yaml', data: { type: 'path' } },
              { key: 'doc-1:paths/api/v1/auth.yaml', label: 'auth.yaml', data: { type: 'path' } },
              { key: 'doc-1:paths/api/v1/posts.yaml', label: 'posts.yaml', data: { type: 'path' } },
              { key: 'doc-1:paths/api/v1/comments.yaml', label: 'comments.yaml', data: { type: 'path' } },
            ],
          },
        ],
      },
    ],
  },
];

/** Split-структура для doc-2 (упрощённая). */
const buildDoc2Tree = (): NodeWithType[] => [
  {
    key: 'doc-2:components',
    label: 'components',
    data: { type: 'folder' },
    children: [
      {
        key: 'doc-2:components/schemas',
        label: 'schemas',
        data: { type: 'folder' },
        children: [
          { key: 'doc-2:components/schemas/Product.yaml', label: 'Product.yaml', data: { type: 'schema' } },
        ],
      },
    ],
  },
  {
    key: 'doc-2:paths',
    label: 'paths',
    data: { type: 'folder' },
    children: [
      {
        key: 'doc-2:paths/api',
        label: 'api',
        data: { type: 'folder' },
        children: [
          {
            key: 'doc-2:paths/api/v1',
            label: 'v1',
            data: { type: 'folder' },
            children: [
              { key: 'doc-2:paths/api/v1/products.yaml', label: 'products.yaml', data: { type: 'path' } },
            ],
          },
        ],
      },
    ],
  },
];

/** Моковые документы: filename + tree. Пока 2 документа в «истории». */
export const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: 'doc-1', filename: 'openapi-v1.yaml', tree: buildDoc1Tree() },
  { id: 'doc-2', filename: 'another-spec.yaml', tree: buildDoc2Tree() },
];
