/// <reference types="vite/client" />

declare module 'js-yaml' {
  export function load(str: string): unknown;
  export function dump(obj: unknown): string;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
