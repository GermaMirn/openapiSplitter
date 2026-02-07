import type { editor } from 'monaco-editor';
import type Monaco from 'monaco-editor';
import { YAML_REF_REGEX } from '../constants';

/**
 * Создаёт decorations для подсветки YAML ссылок в редакторе
 */
function createLinkDecorations(
  editor: editor.IStandaloneCodeEditor,
  monaco: typeof Monaco
): editor.IModelDeltaDecoration[] {
  const model = editor.getModel();
  if (!model) return [];

  const decorations: editor.IModelDeltaDecoration[] = [];

  for (let lineNumber = 1; lineNumber <= model.getLineCount(); lineNumber++) {
    const lineContent = model.getLineContent(lineNumber);
    let match: RegExpExecArray | null;

    const regex = new RegExp(YAML_REF_REGEX);
    while ((match = regex.exec(lineContent)) !== null) {
      const startColumn = match.index + 1;
      const endColumn = startColumn + match[0].length;

      decorations.push({
        range: new monaco.Range(lineNumber, startColumn, lineNumber, endColumn),
        options: {
          inlineClassName: 'yaml-ref-link',
          hoverMessage: { value: `Перейти к файлу: ${match[1]}` },
        },
      });
    }
  }

  return decorations;
}

/**
 * Регистрирует обработчик клика по YAML ссылкам
 */
function registerClickHandler(
  editor: editor.IStandaloneCodeEditor,
  monaco: typeof Monaco,
  onRefClick: (refPath: string) => void
): Monaco.IDisposable {
  return editor.onMouseDown((e) => {
    const target = e.target;
    if (target.type !== monaco.editor.MouseTargetType.CONTENT_TEXT) return;

    const position = target.position;
    if (!position) return;

    const model = editor.getModel();
    if (!model) return;

    const lineContent = model.getLineContent(position.lineNumber);
    let match: RegExpExecArray | null;

    const regex = new RegExp(YAML_REF_REGEX);
    while ((match = regex.exec(lineContent)) !== null) {
      const startColumn = match.index + 1;
      const endColumn = startColumn + match[0].length;

      if (position.column >= startColumn && position.column <= endColumn) {
        e.event.preventDefault();
        e.event.stopPropagation();
        onRefClick(match[1]);
        return;
      }
    }
  });
}

/**
 * Настраивает кликабельные YAML ссылки в Monaco Editor
 * Возвращает функцию для очистки обработчиков
 */
export function setupYamlLinks(
  editor: editor.IStandaloneCodeEditor,
  monaco: typeof Monaco,
  onRefClick: (refPath: string) => void
): () => void {
  // Обработчик клика
  const clickDisposable = registerClickHandler(editor, monaco, onRefClick);

  // Декорации для подсветки ссылок
  const updateDecorations = () => {
    const decorations = createLinkDecorations(editor, monaco);
    editor.createDecorationsCollection(decorations);
  };

  // Применяем декорации после монтирования
  setTimeout(updateDecorations, 100);

  // Cleanup
  return () => {
    clickDisposable.dispose();
  };
}
