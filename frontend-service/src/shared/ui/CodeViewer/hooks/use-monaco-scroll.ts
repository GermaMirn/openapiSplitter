import { useEffect } from 'react';
import type { editor } from 'monaco-editor';

/**
 * Хук для подключения scrollContainerRef к Monaco Editor и восстановления позиции скролла
 */
export function useMonacoScroll(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
  scrollContainerRef?: React.RefObject<HTMLElement | null>,
  content?: string
) {
  useEffect(() => {
    if (!scrollContainerRef || !editorRef.current) return;

    const domNode = editorRef.current.getDomNode();
    if (!domNode) return;

    const scrollableElement = domNode.querySelector('.monaco-scrollable-element') as HTMLElement;
    if (scrollableElement) {
      (scrollContainerRef as React.MutableRefObject<HTMLElement | null>).current = scrollableElement;
    }
  }, [content, scrollContainerRef, editorRef]);
}
