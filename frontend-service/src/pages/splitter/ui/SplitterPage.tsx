import React, { useRef, useState } from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { MainContent } from '@/widgets/main-content';
import { useFileTreeNodes } from '@/features/file-tree-data';
import { useUploadSpec } from '@/features/upload-spec';
import { useToast } from '@/shared/lib/toast';
import { useRefNavigation } from '@/features/view-file-content/hook/use-ref-navigation';
import { getAncestorKeys } from '@/features/view-file-content/lib/get-ancestor-keys';
import type { TreeExpandedKeys } from '@/shared/ui/FileTree/props';

export const SplitterPage: React.FC = () => {
  const { nodes, isLoading: isLoadingTree, refetch } = useFileTreeNodes();
  const { uploadFile, isLoading: isUploading } = useUploadSpec();
  const toast = useToast();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeys>({});
  const [backStack, setBackStack] = useState<Array<{ key: string; scrollTop: number }>>([]);
  const [restoreScroll, setRestoreScroll] = useState<number | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    setBackStack([]);
  };

  const handleTreeSelect = (key: string | null) => {
    setBackStack([]);
    setSelectedKey(key);
  };

  const handleBreadcrumbSelect = (key: string) => {
    setBackStack([]);
    setSelectedKey(key);
    const ancestors = getAncestorKeys(nodes, key);
    const keysToExpand = ancestors.reduce<TreeExpandedKeys>((acc, k) => ({ ...acc, [k]: true }), {});
    setExpandedKeys((prev) => ({ ...prev, ...keysToExpand }));
  };

  const handleFileDeleted = async () => {
    setSelectedKey(null);
    setBackStack([]);
    await refetch();
  };

  const refNavigate = useRefNavigation(nodes, selectedKey, setSelectedKey, setExpandedKeys);

  const handleRefClick = (refPath: string) => {
    const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
    if (selectedKey) setBackStack((prev) => [...prev, { key: selectedKey, scrollTop }]);
    refNavigate(refPath);
  };

  const handleBack = () => {
    const item = backStack[backStack.length - 1];
    if (!item) return;
    setBackStack((prev) => prev.slice(0, -1));
    setSelectedKey(item.key);
    setRestoreScroll(item.scrollTop);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar
        treeNodes={nodes}
        selectedKey={selectedKey}
        onSelect={handleTreeSelect}
        expandedKeys={expandedKeys}
        onExpandedKeysChange={setExpandedKeys}
        isLoading={isLoadingTree}
        onOpenUpload={handleOpenUploadZone}
        refetch={refetch}
        onDocumentDeleted={() => {
          setSelectedKey(null);
          setBackStack([]);
        }}
      />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 min-h-0 p-5 flex flex-col">
          <MainContent
            showUploadZone={showUploadZone}
            pendingFile={pendingFile}
            onFileSelect={handleFileChosen}
            onConfirmUpload={handleConfirmUpload}
            onCancelPreview={handleCancelPreview}
            selectedKey={selectedKey}
            treeNodes={nodes}
            onBreadcrumbSelect={handleBreadcrumbSelect}
            isUploading={isUploading}
            onFileDeleted={handleFileDeleted}
            onRefClick={handleRefClick}
            scrollContainerRef={scrollContainerRef}
            showBackButton={backStack.length > 0}
            onBack={handleBack}
            restoreScroll={restoreScroll}
            onScrollRestored={() => setRestoreScroll(null)}
            className="flex-1 min-h-0"
          />
        </div>
      </main>
    </div>
  );
};
