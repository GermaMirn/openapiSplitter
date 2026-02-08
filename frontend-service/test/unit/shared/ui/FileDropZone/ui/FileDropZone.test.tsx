import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimeReactProvider } from 'primereact/api';
import { FileDropZone } from '@/shared/ui/FileDropZone';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PrimeReactProvider>{children}</PrimeReactProvider>
);

describe('FileDropZone', () => {
  it('рендерит title и hint', () => {
    render(
      <FileDropZone
        onFileSelect={vi.fn()}
        title="Upload file"
        hint="Drag here"
      />,
      { wrapper }
    );
    expect(screen.getByText('Upload file')).toBeInTheDocument();
    expect(screen.getByText('Drag here')).toBeInTheDocument();
  });

  it('вызывает onFileSelect при выборе .yaml файла', () => {
    const onFileSelect = vi.fn();
    render(<FileDropZone onFileSelect={onFileSelect} />, { wrapper });

    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('вызывает onFileSelect при выборе .yml файла', () => {
    const onFileSelect = vi.fn();
    render(<FileDropZone onFileSelect={onFileSelect} />, { wrapper });

    const file = new File(['content'], 'spec.yml', { type: 'text/yaml' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('игнорирует файлы не .yaml/.yml', () => {
    const onFileSelect = vi.fn();
    render(<FileDropZone onFileSelect={onFileSelect} />, { wrapper });

    const file = new File(['content'], 'api.json', { type: 'application/json' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('при change без файлов не вызывает onFileSelect (branch 25)', () => {
    const onFileSelect = vi.fn();
    render(<FileDropZone onFileSelect={onFileSelect} />, { wrapper });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('при drop без файлов не вызывает onFileSelect (branch 33)', () => {
    const onFileSelect = vi.fn();
    render(<FileDropZone onFileSelect={onFileSelect} />, { wrapper });

    const dropZone = screen.getAllByRole('button')[0];
    fireEvent.drop(dropZone, { dataTransfer: { files: [] } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('обрабатывает drag over', () => {
    render(<FileDropZone onFileSelect={vi.fn()} />, { wrapper });

    const dropZone = screen.getAllByRole('button')[0]; // Первая кнопка - зона
    fireEvent.dragOver(dropZone);

    expect(dropZone.className).toContain('border-blue-500');
  });

  it('обрабатывает drag leave', () => {
    render(<FileDropZone onFileSelect={vi.fn()} />, { wrapper });

    const dropZone = screen.getAllByRole('button')[0];
    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);

    expect(dropZone.className).toContain('border-gray-300');
  });

  it('обрабатывает drop файла', () => {
    const onFileSelect = vi.fn();
    render(<FileDropZone onFileSelect={onFileSelect} />, { wrapper });

    const file = new File(['content'], 'api.yaml', { type: 'text/yaml' });
    const dropZone = screen.getAllByRole('button')[0];
    
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('открывает диалог выбора файла при клике на кнопку', () => {
    render(<FileDropZone onFileSelect={vi.fn()} buttonLabel="Select" />, { wrapper });

    const buttons = screen.getAllByRole('button');
    const selectButton = buttons[1];
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(selectButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('при клике по кнопке с buttonLabel вызывается input.click (строки 81-83)', () => {
    render(<FileDropZone onFileSelect={vi.fn()} buttonLabel="Upload" />, { wrapper });

    const buttons = screen.getAllByRole('button');
    const uploadButton = buttons[1];
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(uploadButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('открывает диалог при нажатии Enter на зоне', () => {
    render(<FileDropZone onFileSelect={vi.fn()} />, { wrapper });

    const dropZone = screen.getAllByRole('button')[0];
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.keyDown(dropZone, { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('применяет className', () => {
    render(<FileDropZone onFileSelect={vi.fn()} className="custom" />, { wrapper });

    const dropZone = screen.getAllByRole('button')[0];
    expect(dropZone.className).toContain('custom');
  });

  it('не рендерит кнопку если buttonLabel пустой', () => {
    render(<FileDropZone onFileSelect={vi.fn()} buttonLabel="" />, { wrapper });

    // Должна быть только зона, без кнопки внутри
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
  });
});
