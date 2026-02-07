import { describe, it, expect } from 'vitest';
import { injectLinkStyles } from '@/shared/ui/CodeViewer/lib/inject-link-styles';

describe('injectLinkStyles', () => {
  it('добавляет style элемент в head', () => {
    const cleanup = injectLinkStyles();
    
    const styles = Array.from(document.head.querySelectorAll('style'));
    const injectedStyle = styles.find(s => s.textContent?.includes('yaml-ref-link'));
    
    expect(injectedStyle).toBeDefined();
    
    cleanup();
  });

  it('cleanup удаляет style элемент', () => {
    const cleanup = injectLinkStyles();
    cleanup();
    
    const styles = Array.from(document.head.querySelectorAll('style'));
    const injectedStyle = styles.find(s => s.textContent?.includes('yaml-ref-link'));
    
    expect(injectedStyle).toBeUndefined();
  });
});
