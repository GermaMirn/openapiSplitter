/**
 * Добавляет стили для YAML ссылок в DOM
 * Возвращает функцию для очистки (удаления стилей)
 */
export function injectLinkStyles(): () => void {
  const style = document.createElement('style');
  style.textContent = `
    .yaml-ref-link {
      color: #0066cc !important;
      text-decoration: underline;
      cursor: pointer;
    }
    .yaml-ref-link:hover {
      color: #0052a3 !important;
    }
  `;
  document.head.appendChild(style);

  return () => {
    style.remove();
  };
}
