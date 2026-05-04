/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_BASE_URL?: string;
  readonly VITE_REALTIME_WS_URL?: string;
  readonly VITE_REALTIME_ENABLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
