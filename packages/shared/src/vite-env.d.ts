interface ImportMetaEnv { readonly VITE_REALTIME_WS_URL?: string; readonly VITE_REALTIME_ENABLE?: string; readonly VITE_API_MODE?: string; readonly MODE?: string; readonly [key: string]: string | undefined; }
interface ImportMeta { readonly env: ImportMetaEnv; }
