/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** `off` отключает встроенный набор демо-данных (см. src/mocks/README.md). */
  readonly VITE_DEMO_DATA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
