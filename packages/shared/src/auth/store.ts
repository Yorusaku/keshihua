/**
 * 认证 Store（支持 mock/real 双模式）
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { LoginPayload, User, PermissionAction, UserRole } from "./types";
import { mockLogin, mockRefreshToken } from "./mockAuth";

const API_BASE = "/api";

function isMockMode(): boolean {
  return (import.meta as any).env?.VITE_API_MODE === "mock";
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function apiLogin(payload: LoginPayload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "登录失败" }));
    throw new Error(err.message || "登录失败");
  }
  return res.json();
}

async function apiGetMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("登录已过期");
  return res.json();
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const loginTime = ref<number | undefined>(undefined);
  const expiresAt = ref<number | undefined>(undefined);

  const isAuthenticated = computed(() => !!user.value && !!token.value);

  async function login(payload: LoginPayload): Promise<void> {
    isLoading.value = true;
    try {
      if (isMockMode()) {
        const response = await mockLogin(payload);
        user.value = response.user;
        token.value = response.token;
        refreshToken.value = response.refreshToken;
        loginTime.value = Date.now();
        expiresAt.value = Date.now() + response.expiresIn * 1000;
      } else {
        const response = await apiLogin(payload);
        user.value = response.user;
        token.value = response.token;
        refreshToken.value = response.refreshToken;
        loginTime.value = Date.now();
        expiresAt.value = Date.now() + (response.expiresIn || 7200) * 1000;
      }

      if (payload.remember) {
        localStorage.setItem("auth_token", token.value!);
        localStorage.setItem("auth_refresh_token", refreshToken.value!);
        localStorage.setItem("auth_user", JSON.stringify(user.value));
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    user.value = null;
    token.value = null;
    refreshToken.value = null;
    loginTime.value = undefined;
    expiresAt.value = undefined;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    localStorage.removeItem("auth_user");
  }

  async function refreshAccessToken(): Promise<void> {
    if (!refreshToken.value) throw new Error("无刷新令牌");
    if (isMockMode()) {
      const response = await mockRefreshToken(refreshToken.value);
      token.value = response.token;
      expiresAt.value = Date.now() + response.expiresIn * 1000;
    }
  }

  function hasPermission(resource: string, action: PermissionAction): boolean {
    if (!user.value) return false;
    return user.value.permissions.some(
      (p) => (p.resource === "*" || p.resource === resource) && p.actions.includes(action)
    );
  }

  function hasRole(role: UserRole): boolean {
    return user.value?.role === role;
  }

  async function restoreSession(): Promise<void> {
    const savedToken = localStorage.getItem("auth_token");
    const savedRefreshToken = localStorage.getItem("auth_refresh_token");
    const savedUser = localStorage.getItem("auth_user");

    if (!isMockMode() && savedToken) {
      try {
        const me = await apiGetMe();
        user.value = me;
        token.value = savedToken;
        refreshToken.value = savedRefreshToken;
        return;
      } catch {
        logout();
        return;
      }
    }

    if (savedToken && savedRefreshToken && savedUser) {
      token.value = savedToken;
      refreshToken.value = savedRefreshToken;
      user.value = JSON.parse(savedUser);
    }
  }

  return {
    user, token, refreshToken, isLoading, loginTime, expiresAt, isAuthenticated,
    login, logout, refreshAccessToken, hasPermission, hasRole, restoreSession,
  };
});
