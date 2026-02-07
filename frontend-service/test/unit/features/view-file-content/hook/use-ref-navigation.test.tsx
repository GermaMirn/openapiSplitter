import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRefNavigation } from '@/features/view-file-content/hook/use-ref-navigation';
import { ToastProvider } from '@/shared/lib/toast';
import { PrimeReactProvider } from 'primereact/api';
import type { TreeNode } from '@/shared/types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>
    <ToastProvider>{children}</ToastProvider>
  </PrimeReactProvider>
);

const nodes: TreeNode[] = [
  {
    key: 'doc-openapi',
    label: 'openapi.yaml',
    data: { type: 'file', path: 'doc/openapi.yaml' },
  },
  {
    key: 'doc-schemas-user',
    label: 'user.yaml',
    data: { type: 'file', path: 'doc/schemas/user.yaml' },
  },
];

describe('useRefNavigation', () => {
  it('переходит к файлу по относительному пути', () => {
    const setSelectedKey = vi.fn();
    const setExpandedKeys = vi.fn();

    const { result } = renderHook(
      () =>
        useRefNavigation(nodes, 'doc-openapi', setSelectedKey, setExpandedKeys),
      { wrapper }
    );

    result.current('./schemas/user.yaml');

    expect(setSelectedKey).toHaveBeenCalledWith('doc-schemas-user');
  });

  it('вызывает setExpandedKeys с ключами предков', () => {
    const nodesWithParents: TreeNode[] = [
      {
        key: 'doc',
        label: 'doc',
        data: { type: 'document' },
        children: [
          {
            key: 'doc-schemas',
            label: 'schemas',
            data: { type: 'folder' },
            children: [
              {
                key: 'doc-schemas-user',
                label: 'user.yaml',
                data: { type: 'file', path: 'doc/schemas/user.yaml' },
              },
            ],
          },
        ],
      },
      {
        key: 'doc-openapi',
        label: 'openapi.yaml',
        data: { type: 'file', path: 'doc/openapi.yaml' },
      },
    ];

    const setSelectedKey = vi.fn();
    const setExpandedKeys = vi.fn();

    const { result } = renderHook(
      () =>
        useRefNavigation(
          nodesWithParents,
          'doc-openapi',
          setSelectedKey,
          setExpandedKeys
        ),
      { wrapper }
    );

    result.current('./schemas/user.yaml');

    expect(setExpandedKeys).toHaveBeenCalled();
    expect(setSelectedKey).toHaveBeenCalledWith('doc-schemas-user');
  });

  it('не падает при selectedKey = null (toast вызывается)', () => {
    const setSelectedKey = vi.fn();
    const setExpandedKeys = vi.fn();

    const { result } = renderHook(
      () => useRefNavigation(nodes, null, setSelectedKey, setExpandedKeys),
      { wrapper }
    );

    result.current('./schemas/user.yaml');

    expect(setSelectedKey).not.toHaveBeenCalled();
  });

  it('показывает toast error для несуществующего файла', () => {
    const setSelectedKey = vi.fn();
    const setExpandedKeys = vi.fn();

    const { result } = renderHook(
      () => useRefNavigation(nodes, 'doc-openapi', setSelectedKey, setExpandedKeys),
      { wrapper }
    );

    result.current('./nonexistent.yaml');

    expect(setSelectedKey).not.toHaveBeenCalled();
  });

  it('обрабатывает путь без ./ префикса', () => {
    const setSelectedKey = vi.fn();
    const setExpandedKeys = vi.fn();

    const { result } = renderHook(
      () => useRefNavigation(nodes, 'doc-openapi', setSelectedKey, setExpandedKeys),
      { wrapper }
    );

    result.current('schemas/user.yaml');

    expect(setSelectedKey).toHaveBeenCalledWith('doc-schemas-user');
  });

  it('setExpandedKeys callback корректно обновляет состояние', () => {
    const nodesWithParents: TreeNode[] = [
      {
        key: 'doc',
        label: 'doc',
        data: { type: 'document' },
        children: [
          {
            key: 'doc-schemas',
            label: 'schemas',
            data: { type: 'folder' },
            children: [
              {
                key: 'doc-schemas-user',
                label: 'user.yaml',
                data: { type: 'file', path: 'doc/schemas/user.yaml' },
              },
            ],
          },
        ],
      },
      {
        key: 'doc-openapi',
        label: 'openapi.yaml',
        data: { type: 'file', path: 'doc/openapi.yaml' },
      },
    ];

    const setSelectedKey = vi.fn();
    const setExpandedKeys = vi.fn((updater) => {
      // Симулируем работу с функцией-updater
      if (typeof updater === 'function') {
        const prev = {};
        const next = updater(prev);
        expect(next['doc']).toBe(true);
        expect(next['doc-schemas']).toBe(true);
      }
    });

    const { result } = renderHook(
      () =>
        useRefNavigation(
          nodesWithParents,
          'doc-openapi',
          setSelectedKey,
          setExpandedKeys
        ),
      { wrapper }
    );

    result.current('./schemas/user.yaml');

    expect(setExpandedKeys).toHaveBeenCalled();
  });
});
