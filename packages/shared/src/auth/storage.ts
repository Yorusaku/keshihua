/**
 * Auth session persistence.
 *
 * Tokens always go to sessionStorage so in-tab API/WebSocket calls can attach
 * credentials. localStorage is only used when remember-me is enabled.
 */

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_REFRESH_TOKEN_KEY = "auth_refresh_token";
const AUTH_USER_KEY = "auth_user";

interface AuthSessionInput {
  token: string;
  refreshToken?: string | null;
  user?: unknown;
  remember?: boolean;
}

function persistentStorage(): Storage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function sessionStore(): Storage | null {
  return typeof sessionStorage === "undefined" ? null : sessionStorage;
}

function readValue(key: string): string | null {
  return persistentStorage()?.getItem(key) ?? sessionStore()?.getItem(key) ?? null;
}

function writeSession(store: Storage, token: string, refreshToken: string, user: string): void {
  store.setItem(AUTH_TOKEN_KEY, token);
  store.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  store.setItem(AUTH_USER_KEY, user);
}

function removeSession(store: Storage): void {
  store.removeItem(AUTH_TOKEN_KEY);
  store.removeItem(AUTH_REFRESH_TOKEN_KEY);
  store.removeItem(AUTH_USER_KEY);
}

export function persistAuthSession(input: AuthSessionInput): void {
  const refreshToken = input.refreshToken ?? "";
  const user = input.user === undefined ? "" : JSON.stringify(input.user);

  const session = sessionStore();
  if (session) {
    writeSession(session, input.token, refreshToken, user);
  }

  const persistent = persistentStorage();
  if (persistent) {
    if (input.remember) {
      writeSession(persistent, input.token, refreshToken, user);
    } else {
      removeSession(persistent);
    }
  }
}

export function clearAuthSession(): void {
  const session = sessionStore();
  if (session) removeSession(session);
  const persistent = persistentStorage();
  if (persistent) removeSession(persistent);
}

export function getStoredAuthToken(): string | null {
  return readValue(AUTH_TOKEN_KEY);
}

export function getStoredAuthRefreshToken(): string | null {
  return readValue(AUTH_REFRESH_TOKEN_KEY);
}

export function getStoredAuthUser(): string | null {
  return readValue(AUTH_USER_KEY);
}