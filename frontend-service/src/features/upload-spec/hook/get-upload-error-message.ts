export function getUploadErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return 'Ошибка загрузки файла';
}
