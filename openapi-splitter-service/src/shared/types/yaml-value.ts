/**
 * Значение, которое может быть в YAML/JSON (результат parse, аргумент stringify).
 */
export type YamlValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: YamlValue }
  | YamlValue[];
