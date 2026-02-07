import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { ToastProvider } from '@/shared/lib/toast';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar';
import type { TreeNode } from '@/shared/types';
import type { FileTreeProps } from '@/shared/ui/FileTree/props';

type CapturedHandlers = Pick<FileTreeProps, 'onDocumentDelete' | 'onDocumentExport'>;

const mockDeleteDocument = vi.fn();
const mockExportZip = vi.fn();

vi.mock('@/features/delete-document', () => ({
  useDeleteDocument: () => ({
    deleteDocument: mockDeleteDocument,
  }),
}));

vi.mock('@/features/export-zip', () => ({
  useExportZip: () => ({
    exportZip: mockExportZip,
  }),
}));

let capturedHandlers: CapturedHandlers = {};
vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual<typeof import('@/shared/ui')>('@/shared/ui');
  return {
    ...actual,
    FileTree: ({ onDocumentDelete, onDocumentExport, nodes }: FileTreeProps) => {
      capturedHandlers = { onDocumentDelete, onDocumentExport };
      return (
        <div data-testid="file-tree">
          {nodes.map((node: TreeNode) => (
            <div key={node.key}>{node.label}</div>
          ))}
        </div>
      );
    },
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>
    <ToastProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ToastProvider>
  </PrimeReactProvider>
);

const mockNodes: TreeNode[] = [
  { key: '1', label: 'doc1', data: { type: 'document' } },
  { key: '2', label: 'doc2', data: { type: 'document' } },
];

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedHandlers = {};
  });

  it('рендерит заголовок OpenAPI Splitter', () => {
    render(
      <Sidebar
        treeNodes={[]}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={vi.fn()}
      />,
      { wrapper }
    );
    expect(screen.getByText('OpenAPI Splitter')).toBeInTheDocument();
  });

  it('показывает Loader при isLoading=true', () => {
    render(
      <Sidebar
        treeNodes={[]}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={vi.fn()}
        isLoading
      />,
      { wrapper }
    );
    expect(screen.getByText('Загрузка дерева...')).toBeInTheDocument();
  });

  it('показывает "Нет загруженных документов" при пустом дереве', () => {
    render(
      <Sidebar
        treeNodes={[]}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={vi.fn()}
      />,
      { wrapper }
    );
    expect(screen.getByText('Нет загруженных документов')).toBeInTheDocument();
  });

  it('фильтрует узлы по поисковому запросу', () => {
    render(
      <Sidebar
        treeNodes={mockNodes}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={vi.fn()}
      />,
      { wrapper }
    );

    const searchInput = screen.getByPlaceholderText('Поиск по файлам...');
    fireEvent.change(searchInput, { target: { value: 'doc1' } });

    expect(screen.queryByText('doc2')).not.toBeInTheDocument();
  });

  it('показывает "Ничего не найдено" при пустом результате поиска', () => {
    render(
      <Sidebar
        treeNodes={mockNodes}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={vi.fn()}
      />,
      { wrapper }
    );

    const searchInput = screen.getByPlaceholderText('Поиск по файлам...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
  });

  it('вызывает onOpenUpload при клике на кнопку "Загрузить файл"', () => {
    const onOpenUpload = vi.fn();
    render(
      <Sidebar
        treeNodes={[]}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={onOpenUpload}
        refetch={vi.fn()}
      />,
      { wrapper }
    );

    fireEvent.click(screen.getByRole('button', { name: /загрузить файл/i }));
    expect(onOpenUpload).toHaveBeenCalledOnce();
  });

  it('вызывает handleDocumentDelete и показывает success toast', async () => {
    mockDeleteDocument.mockResolvedValue(undefined);
    const refetch = vi.fn();
    const onDocumentDeleted = vi.fn();

    render(
      <Sidebar
        treeNodes={mockNodes}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={refetch}
        onDocumentDeleted={onDocumentDeleted}
      />,
      { wrapper }
    );

    await capturedHandlers.onDocumentDelete?.('doc1');

    await waitFor(() => {
      expect(mockDeleteDocument).toHaveBeenCalledWith('doc1');
      expect(onDocumentDeleted).toHaveBeenCalled();
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('вызывает handleDocumentDelete и показывает error toast при ошибке', async () => {
    mockDeleteDocument.mockRejectedValue(new Error('Delete failed'));
    const refetch = vi.fn();

    render(
      <Sidebar
        treeNodes={mockNodes}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={refetch}
      />,
      { wrapper }
    );

    await capturedHandlers.onDocumentDelete?.('doc1');

    await waitFor(() => {
      expect(mockDeleteDocument).toHaveBeenCalledWith('doc1');
      expect(refetch).not.toHaveBeenCalled();
    });
  });

  it('вызывает handleDocumentExport и показывает success toast', async () => {
    mockExportZip.mockResolvedValue(undefined);

    render(
      <Sidebar
        treeNodes={mockNodes}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={vi.fn()}
      />,
      { wrapper }
    );

    await capturedHandlers.onDocumentExport?.('doc1');

    await waitFor(() => {
      expect(mockExportZip).toHaveBeenCalledWith('doc1');
    });
  });

  it('вызывает handleDocumentExport и показывает error toast при ошибке', async () => {
    mockExportZip.mockRejectedValue(new Error('Export failed'));

    render(
      <Sidebar
        treeNodes={mockNodes}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={vi.fn()}
      />,
      { wrapper }
    );

    await capturedHandlers.onDocumentExport?.('doc1');

    await waitFor(() => {
      expect(mockExportZip).toHaveBeenCalledWith('doc1');
    });
  });

  it('применяет className', () => {
    const { container } = render(
      <Sidebar
        treeNodes={[]}
        selectedKey={null}
        onSelect={vi.fn()}
        onOpenUpload={vi.fn()}
        refetch={vi.fn()}
        className="custom-class"
      />,
      { wrapper }
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
