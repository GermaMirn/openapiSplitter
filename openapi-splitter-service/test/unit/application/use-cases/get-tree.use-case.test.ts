import { describe, it, expect, vi } from 'vitest';
import { GetTreeUseCase } from '@/application/use-cases/get-tree.use-case';
import { TreeBuilder } from '@/infrastructure/tree/tree-builder';

describe('GetTreeUseCase', () => {
  it('возвращает дерево из files-service (успех)', async () => {
    const mockListFiles = vi.fn().mockResolvedValue([
      { id: 'f1', path: 'docs/spec/openapi.yaml' },
    ]);
    const filesServiceClient = {
      listFiles: mockListFiles,
    } as never;
    const treeBuilder = new TreeBuilder();
    const useCase = new GetTreeUseCase(filesServiceClient, treeBuilder);

    const result = await useCase.execute();

    expect(mockListFiles).toHaveBeenCalledOnce();
    expect(result.tree).toHaveLength(1);
  });
});
