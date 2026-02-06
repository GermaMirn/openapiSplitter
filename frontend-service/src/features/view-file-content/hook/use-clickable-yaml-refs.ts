import { useEffect } from 'react';

/**
 * Хук для преобразования путей ./...yaml в кликабельные ссылки.
 */
export function useClickableYamlRefs(
  containerRef: React.RefObject<HTMLDivElement | null>,
  content: string,
  onRefClick?: (refPath: string) => void,
  enabled = false
): void {
  useEffect(() => {
    if (!enabled || !onRefClick || !containerRef.current) return;

    const container = containerRef.current;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const nodesToReplace: Array<{ node: Text; match: RegExpMatchArray }> = [];
    let currentNode: Text | null;

    while ((currentNode = walker.nextNode() as Text | null)) {
      const text = currentNode.textContent || '';
      const match = text.match(/(\.\/[^\s\n]+\.yaml)/);
      if (match) {
        nodesToReplace.push({ node: currentNode, match });
      }
    }

    nodesToReplace.forEach(({ node, match }) => {
      const text = node.textContent || '';
      const refPath = match[1];
      const beforePath = text.substring(0, match.index!);
      const afterPath = text.substring(match.index! + refPath.length);
      const relativePath = refPath.replace(/^\.\//, '');

      const span = document.createElement('span');

      if (beforePath) {
        span.appendChild(document.createTextNode(beforePath));
      }

      const link = document.createElement('a');
      link.href = '#';
      link.textContent = refPath;
      link.style.color = '#2563eb';
      link.style.textDecoration = 'underline';
      link.style.cursor = 'pointer';
      link.style.fontWeight = '500';

      link.addEventListener('click', (e) => {
        e.preventDefault();
        onRefClick(relativePath);
      });

      link.addEventListener('mouseenter', () => {
        link.style.color = '#1d4ed8';
      });

      link.addEventListener('mouseleave', () => {
        link.style.color = '#2563eb';
      });

      span.appendChild(link);

      if (afterPath) {
        span.appendChild(document.createTextNode(afterPath));
      }

      node.parentNode?.replaceChild(span, node);
    });
  }, [containerRef, content, onRefClick, enabled]);
}
