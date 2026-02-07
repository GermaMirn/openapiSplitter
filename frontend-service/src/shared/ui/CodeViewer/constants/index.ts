/**
 * Регулярное выражение для поиска YAML ссылок вида ./path/to/file.yaml
 */
export const YAML_REF_REGEX = /(\.\/[^\s\n'"]+\.yaml)/g;
