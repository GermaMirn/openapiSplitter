import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { FilePreview } from '@/shared/ui/FilePreview';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>{children}</PrimeReactProvider>
);

describe('FilePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит имя файла', () => {
    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper }
    );

    expect(screen.getByText('api.yaml')).toBeInTheDocument();
  });

  it('отображает кнопки "Загрузить" и "Отменить"', async () => {
    const validOpenAPI = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      responses:
        '200':
          description: OK`;
    const file = new File([validOpenAPI], 'api.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /загрузить/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /отменить/i })).toBeInTheDocument();
  });

  it('кнопка "Загрузить" disabled при disabled=true', () => {
    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        disabled
      />,
      { wrapper }
    );

    const uploadButton = screen.getByRole('button', { name: /загрузить/i });
    expect(uploadButton).toBeDisabled();
  });

  it('кнопка "Отменить" disabled при disabled=true', () => {
    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        disabled
      />,
      { wrapper }
    );

    const cancelButton = screen.getByRole('button', { name: /отменить/i });
    expect(cancelButton).toBeDisabled();
  });

  it('применяет className', () => {
    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });

    const { container } = render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        className="custom-class"
      />,
      { wrapper }
    );

    const preview = container.querySelector('.custom-class');
    expect(preview).toBeInTheDocument();
  });

  it('показывает loader при загрузке файла', async () => {
    const validOpenAPI = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      responses:
        '200':
          description: OK`;
    const file = new File([validOpenAPI], 'api.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /загрузить/i })).toBeInTheDocument();
    });
  });

  it('показывает ошибку при превышении максимального размера файла', async () => {
    const largeContent = 'x'.repeat(11 * 1024 * 1024);
    const file = new File([largeContent], 'large.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/файл слишком большой/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: /загрузить/i });
    expect(uploadButton).toBeDisabled();
  });

  it('показывает ошибку при невалидном YAML', async () => {
    const file = new File(['%%%invalid yaml%%%'], 'bad.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    const uploadButton = screen.getByRole('button', { name: /загрузить/i });
    expect(uploadButton).toBeDisabled();
  });

  it('показывает ошибку чтения файла', async () => {
    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });

    const originalFileReader = global.FileReader;
    class MockFileReader {
      onload: ((ev: ProgressEvent) => void) | null = null;
      onerror: ((ev: ProgressEvent) => void) | null = null;
      result: string | ArrayBuffer | null = null;

      readAsText(): void {
        setTimeout(() => {
          if (this.onerror) this.onerror(new ProgressEvent('error'));
        }, 0);
      }
    }
    global.FileReader = MockFileReader as unknown as typeof FileReader;

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/не удалось прочитать файл/i)).toBeInTheDocument();
    });

    global.FileReader = originalFileReader;
  });

  it('вызывает onConfirm при клике на "Загрузить"', async () => {
    const onConfirm = vi.fn();
    const validOpenAPI = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      responses:
        '200':
          description: OK`;
    const file = new File([validOpenAPI], 'api.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /загрузить/i });
      expect(uploadButton).not.toBeDisabled();
    }, { timeout: 3000 });

    const uploadButton = screen.getByRole('button', { name: /загрузить/i });
    fireEvent.click(uploadButton);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('вызывает onCancel при клике на "Отменить"', async () => {
    const onCancel = vi.fn();
    const validOpenAPI = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      responses:
        '200':
          description: OK`;
    const file = new File([validOpenAPI], 'api.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /отменить/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /отменить/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('показывает overlay loader при disabled=true', () => {
    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });

    render(
      <FilePreview
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        disabled
      />,
      { wrapper }
    );

    expect(screen.getAllByText(/загрузка/i).length).toBeGreaterThan(0);
  });
});
