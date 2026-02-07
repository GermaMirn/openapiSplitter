import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type { CodeViewerProps } from '../props';
import { useMonacoScroll } from '../hooks';
import { setupYamlLinks, injectLinkStyles } from '../lib';

export const CodeViewer: React.FC<CodeViewerProps> = ({
  content,
  language = 'yaml',
  className = '',
  scrollContainerRef,
  restoreScroll,
  onScrollRestored,
  onRefClick,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Подключаем scroll container и обновляем при изменении content
  useMonacoScroll(editorRef, scrollContainerRef, content);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Подключаем scrollContainerRef к DOM-элементу редактора
    if (scrollContainerRef) {
      const domNode = editor.getDomNode();
      if (domNode) {
        const scrollableElement = domNode.querySelector('.monaco-scrollable-element') as HTMLElement;
        if (scrollableElement) {
          (scrollContainerRef as React.MutableRefObject<HTMLElement | null>).current = scrollableElement;
        }
      }
    }

    // Восстанавливаем позицию скролла
    if (restoreScroll != null) {
      editor.setScrollTop(restoreScroll);
      onScrollRestored?.();
    }

    // Настраиваем кликабельные YAML ссылки
    if (onRefClick) {
      const cleanupLinks = setupYamlLinks(editor, monaco, onRefClick);
      const cleanupStyles = injectLinkStyles();

      // Cleanup при размонтировании
      return () => {
        cleanupLinks();
        cleanupStyles();
      };
    }
  };

  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={content}
        theme="vs-light"
        onMount={handleEditorDidMount}
        options={{
          readOnly: true,
          domReadOnly: true,
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          renderWhitespace: 'selection',
          fontSize: 14,
          lineHeight: 20,
          padding: { top: 8, bottom: 8 },
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          folding: true,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 4,
        }}
      />
    </div>
  );
};
