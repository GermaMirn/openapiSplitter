import type { TreeNode, TreeNodeType } from '@/shared/types';
import type { ITreeBuilder, TreeBuildableFile } from '@/application/interfaces';

/**
 * Строитель дерева из списка файлов.
 */
export class TreeBuilder implements ITreeBuilder {
  /**
   * Построить дерево из списка файлов
   * @param files - список файлов (id, path)
   * @param originalFileName - оригинальное имя загруженного файла (для label документа)
   * @returns корневые узлы дерева (документы)
   */
  buildTree(files: TreeBuildableFile[], originalFileName?: string): TreeNode[] {
    if (files.length === 0) {
      return [];
    }

    // Группируем файлы по документам (базовый путь до openapi.yaml)
    const documentGroups = this.groupByDocument(files);

    // Для каждого документа строим дерево
    const roots: TreeNode[] = [];
    const groupEntries = Object.entries(documentGroups);

    for (const [documentPath, documentFiles] of groupEntries) {
      // Если передано originalFileName и это единственный документ, используем его
      const docName = (originalFileName && groupEntries.length === 1) ? originalFileName : undefined;
      const documentTree = this.buildDocumentTree(documentPath, documentFiles, docName);
      if (documentTree) {
        roots.push(documentTree);
      }
    }

    return roots;
  }

  /**
   * Группирует файлы по документам
   */
  private groupByDocument(files: TreeBuildableFile[]): Record<string, TreeBuildableFile[]> {
    const groups: Record<string, TreeBuildableFile[]> = {};

    for (const file of files) {
      const documentPath = this.extractDocumentPath(file.path);
      if (!groups[documentPath]) {
        groups[documentPath] = [];
      }
      groups[documentPath].push(file);
    }

    return groups;
  }

  /**
   * Извлекает путь документа из пути файла
   * Например: docs/spec-1/openapi.yaml → docs/spec-1
   * docs/spec-1/components/schemas/User.yaml → docs/spec-1
   */
  private extractDocumentPath(filePath: string): string {
    const parts = filePath.split('/');

    // Ищем индекс openapi.yaml или первого компонента структуры (components, paths)
    const structureIndex = parts.findIndex(
      (p) => p === 'openapi.yaml' || p === 'components' || p === 'paths'
    );

    if (structureIndex > 0) {
      return parts.slice(0, structureIndex).join('/');
    }

    // Если не нашли структуру, берём всё кроме последнего элемента
    return parts.slice(0, -1).join('/') || parts[0] || '';
  }

  /**
   * Строит дерево для одного документа
   * @param documentPath - базовый путь документа
   * @param files - файлы документа
   * @param originalFileName - оригинальное имя файла (если передано, используется как label)
   */
  private buildDocumentTree(documentPath: string, files: TreeBuildableFile[], originalFileName?: string): TreeNode | null {
    if (files.length === 0) return null;

    // Находим корневой файл (openapi.yaml)
    const rootFile = files.find((f) => f.path.endsWith('/openapi.yaml'));

    // Label документа: оригинальное имя файла > имя папки > 'document'
    const documentName = originalFileName || documentPath.split('/').pop() || 'document';

    // Строим детей (components, paths и другие файлы)
    const children = this.buildChildren(documentPath, files);

    return {
      key: rootFile?.id || documentPath,
      label: documentName,
      data: {
        type: 'document',
        path: rootFile?.path,
        fileId: rootFile?.id,
      },
      children,
    };
  }

  /**
   * Строит детей для узла
   */
  private buildChildren(basePath: string, files: TreeBuildableFile[]): TreeNode[] {
    const tree: TreeNode[] = [];
    const pathMap = new Map<string, TreeNode>();

    // Сортируем файлы по пути для правильной иерархии
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

    for (const file of sortedFiles) {
      // Получаем относительный путь от базового пути документа
      const relativePath = this.getRelativePath(basePath, file.path);
      if (!relativePath || relativePath === 'openapi.yaml') {
        // Пропускаем корневой файл, он уже в родителе
        continue;
      }

      const parts = relativePath.split('/');

      // Строим путь по частям, создавая промежуточные папки
      let currentPath = basePath;
      let currentChildren = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = `${currentPath}/${part}`;
        const isLast = i === parts.length - 1;

        let node = pathMap.get(currentPath);

        if (!node) {
          node = {
            key: isLast ? file.id : currentPath,
            label: part,
            data: {
              type: isLast ? this.detectFileType(relativePath) : 'folder',
              path: isLast ? file.path : undefined,
              fileId: isLast ? file.id : undefined,
            },
            children: isLast ? undefined : [],
          };

          pathMap.set(currentPath, node);
          currentChildren.push(node);
        }

        if (!isLast && node.children) {
          currentChildren = node.children;
        }
      }
    }

    return tree;
  }

  /**
   * Получает относительный путь от базового пути
   */
  private getRelativePath(basePath: string, fullPath: string): string {
    const basePrefix = basePath + '/';
    if (fullPath.startsWith(basePrefix)) {
      return fullPath.substring(basePrefix.length);
    }
    return fullPath;
  }

  /**
   * Определяет тип файла по пути
   */
  private detectFileType(relativePath: string): TreeNodeType {
    if (relativePath.startsWith('components/schemas/')) return 'schema';
    if (relativePath.startsWith('components/securitySchemes/')) return 'security';
    if (relativePath.startsWith('paths/')) return 'path';
    return 'file';
  }
}
