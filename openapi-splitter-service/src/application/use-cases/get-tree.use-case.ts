import type { ITreeBuilder } from '@/application/interfaces';
import type { FilesServiceClient } from '@/infrastructure/external';
import type { TreeResponseDto } from '@/application/dto';

/**
 * Use case: получение дерева всех документов
 */
export class GetTreeUseCase {
  constructor(
    private readonly filesServiceClient: FilesServiceClient,
    private readonly treeBuilder: ITreeBuilder
  ) {}

  async execute(): Promise<TreeResponseDto> {
    // Получаем все файлы из files-service
    const files = await this.filesServiceClient.listFiles();

    // Строим дерево
    const tree = this.treeBuilder.buildTree(files);

    return { tree };
  }
}
