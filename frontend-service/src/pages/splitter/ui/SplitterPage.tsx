import React, { useState } from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { MainContent } from '@/widgets/main-content';
import { useFileTreeNodes } from '@/features/file-tree-data';
import { useUploadSpec } from '@/features/upload-spec';
import { useToast } from '@/shared/lib/toast';
import { useRefNavigation } from '@/features/view-file-content/hook/use-ref-navigation';

export const SplitterPage: React.FC = () => {
  const { nodes, isLoading: isLoadingTree, refetch } = useFileTreeNodes();
  const { uploadFile, isLoading: isUploading } = useUploadSpec();
  const toast = useToast();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);

  const handleFileChosen = (file: File) => {
    setPendingFile(file);
    setShowUploadZone(true);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    try {
      const result = await uploadFile(pendingFile);
      toast.success('Файл загружен', `Спецификация успешно разрезана. Создано ${result.totalFiles} файлов`);
      setPendingFile(null);
      setShowUploadZone(false);
      // Перезагружаем дерево после успешной загрузки
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файла';
      toast.error('Ошибка загрузки', errorMessage);
    }
  };

  const handleCancelPreview = () => {
    setPendingFile(null);
    setShowUploadZone(false);
  };

  const handleOpenUploadZone = () => {
    setShowUploadZone(true);
    setSelectedKey(null);
  };

  const handleFileDeleted = async () => {
    setSelectedKey(null);
    await refetch();
  };

  const handleRefClick = useRefNavigation(nodes, selectedKey, setSelectedKey);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar
        treeNodes={nodes}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
        isLoading={isLoadingTree}
        onOpenUpload={handleOpenUploadZone}
        refetch={refetch}
        onDocumentDeleted={() => setSelectedKey(null)}
      />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 min-h-0 overflow-auto p-5">
          <MainContent
            showUploadZone={showUploadZone}
            pendingFile={pendingFile}
            onFileSelect={handleFileChosen}
            onConfirmUpload={handleConfirmUpload}
            onCancelPreview={handleCancelPreview}
            selectedKey={selectedKey}
            treeNodes={nodes}
            isUploading={isUploading}
            onFileDeleted={handleFileDeleted}
            onRefClick={handleRefClick}
          />
        </div>
      </main>
    </div>
  );
};
