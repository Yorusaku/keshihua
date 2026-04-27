/**
 * 认证 Store
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthState, LoginPayload, User, PermissionAction, UserRole } from './types';
import { mockLogin, mockRefreshToken } from './mockAuth';

export const useAuthStore = defineStore('auth', () => {
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
      const response = await mockLogin(payload);
      user.value = response.user;
      token.value = response.token;
      refreshToken.value = response.refreshToken;
      loginTime.value = Date.now();
      expiresAt.value = Date.now() + response.expiresIn * 1000;

      if (payload.remember) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_refresh_token', response.refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
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

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
  }

  async function refreshAccessToken(): Promise<void> {
    if (!refreshToken.value) {
      throw new Error('无刷新令牌');
    }

    const response = await mockRefreshToken(refreshToken.value);
    token.value = response.token;
    expiresAt.value = Date.now() + response.expiresIn * 1000;

    if (localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', response.token);
    }
  }

  function hasPermission(resource: string, action: PermissionAction): boolean {
    if (!user.value) return false;

    return user.value.permissions.some(
      p => (p.resource === '*' || p.resource === resource) && p.actions.includes(action)
    );
  }

  function hasRole(role: UserRole): boolean {
    return user.value?.role === role;
  }

  function restoreSession(): void {
    const savedToken = localStorage.getItem('auth_token');
    const savedRefreshToken = localStorage.getItem('auth_refresh_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedRefreshToken && savedUser) {
      token.value = savedToken;
      refreshToken.value = savedRefreshToken;
      user.value = JSON.parse(savedUser);
    }
  }

  return {
    user,
    token,
    refreshToken,
    isLoading,
    loginTime,
    expiresAt,
    isAuthenticated,
    login,
    logout,
    refreshAccessToken,
    hasPermission,
    hasRole,
    restoreSession,
  };
});
