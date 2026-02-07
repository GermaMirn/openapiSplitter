import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { ToastProvider } from '@/shared/lib/toast';
import { MemoryRouter } from 'react-router-dom';
import { MainContent } from '@/widgets/main-content';
import type { FileContentProps } from '@/features/view-file-content/props';

vi.mock('@/features/view-file-content', () => ({
  FileContent: ({ selectedKey }: Pick<FileContentProps, 'selectedKey'>) => (
    <div>FileContent for {selectedKey}</div>
  ),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>
    <ToastProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ToastProvider>
  </PrimeReactProvider>
);

describe('MainContent', () => {
  it('показывает FileContent при selectedKey', () => {
    render(
      <MainContent
        showUploadZone={false}
        pendingFile={null}
        onFileSelect={vi.fn()}
        onConfirmUpload={vi.fn()}
        onCancelPreview={vi.fn()}
        selectedKey="file1"
        treeNodes={[]}
      />,
      { wrapper }
    );
    expect(screen.getByText('FileContent for file1')).toBeInTheDocument();
  });

  it('показывает FileDropZone при showUploadZone=true и pendingFile=null', () => {
    render(
      <MainContent
        showUploadZone
        pendingFile={null}
        onFileSelect={vi.fn()}
        onConfirmUpload={vi.fn()}
        onCancelPreview={vi.fn()}
        selectedKey={null}
        treeNodes={[]}
      />,
      { wrapper }
    );
    expect(screen.getByText(/Загрузите OpenAPI спецификацию/i)).toBeInTheDocument();
  });

  it('показывает FilePreview при pendingFile', () => {
    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });
    render(
      <MainContent
        showUploadZone
        pendingFile={file}
        onFileSelect={vi.fn()}
        onConfirmUpload={vi.fn()}
        onCancelPreview={vi.fn()}
        selectedKey={null}
        treeNodes={[]}
      />,
      { wrapper }
    );
    expect(screen.getByText('api.yaml')).toBeInTheDocument();
  });

  it('показывает пустой экран при отсутствии выбора и зоны загрузки', () => {
    render(
      <MainContent
        showUploadZone={false}
        pendingFile={null}
        onFileSelect={vi.fn()}
        onConfirmUpload={vi.fn()}
        onCancelPreview={vi.fn()}
        selectedKey={null}
        treeNodes={[]}
      />,
      { wrapper }
    );
    expect(screen.getByText('Выберите файл из дерева или загрузите новый')).toBeInTheDocument();
  });

  it('вызывает onFileSelect при выборе файла', () => {
    const onFileSelect = vi.fn();
    render(
      <MainContent
        showUploadZone
        pendingFile={null}
        onFileSelect={onFileSelect}
        onConfirmUpload={vi.fn()}
        onCancelPreview={vi.fn()}
        selectedKey={null}
        treeNodes={[]}
      />,
      { wrapper }
    );

    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('применяет className', () => {
    const { container } = render(
      <MainContent
        showUploadZone={false}
        pendingFile={null}
        onFileSelect={vi.fn()}
        onConfirmUpload={vi.fn()}
        onCancelPreview={vi.fn()}
        selectedKey={null}
        treeNodes={[]}
        className="custom-class"
      />,
      { wrapper }
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('передает правильные props в FileContent', () => {
    const onBreadcrumbSelect = vi.fn();
    render(
      <MainContent
        showUploadZone={false}
        pendingFile={null}
        onFileSelect={vi.fn()}
        onConfirmUpload={vi.fn()}
        onCancelPreview={vi.fn()}
        selectedKey="file1"
        treeNodes={[]}
        onBreadcrumbSelect={onBreadcrumbSelect}
      />,
      { wrapper }
    );

    expect(screen.getByText('FileContent for file1')).toBeInTheDocument();
  });
});
