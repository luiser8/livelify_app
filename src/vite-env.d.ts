/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_URL: string
  readonly VITE_SESSION_EXPIRE: string
  readonly VITE_CACHE_TTL: string
  readonly VITE_CACHE_ACCESS_COUNT: string
  readonly VITE_CACHE_KEY_PREFIX: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}