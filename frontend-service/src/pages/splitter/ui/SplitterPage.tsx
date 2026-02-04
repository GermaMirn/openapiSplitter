import React, { useState } from 'react';
import { Sidebar } from 'src/widgets/sidebar';
import { MainContent } from 'src/widgets/main-content';
import { useFileTreeNodes } from 'src/features/file-tree-data';
import { useUploadSpec } from 'src/features/upload-spec';

export const SplitterPage: React.FC = () => {
  const treeNodes = useFileTreeNodes();
  const { hasUploaded, handleFileSelect, resetUpload } = useUploadSpec();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileChosen = (file: File) => setPendingFile(file);
  const handleConfirmUpload = () => {
    handleFileSelect();
    setPendingFile(null);
  };
  const handleCancelPreview = () => setPendingFile(null);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar
        treeNodes={treeNodes}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 min-h-0 overflow-auto p-5">
          <MainContent
            hasUploaded={hasUploaded}
            pendingFile={pendingFile}
            onFileSelect={handleFileChosen}
            onConfirmUpload={handleConfirmUpload}
            onCancelPreview={handleCancelPreview}
            onResetUpload={resetUpload}
            selectedKey={selectedKey}
            treeNodes={treeNodes}
          />
        </div>
      </main>
    </div>
  );
};
