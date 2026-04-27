import { computed } from 'vue';
import { useAuthStore } from './store';

export function useAuth() {
  const authStore = useAuthStore();

  return {
    user: computed(() => authStore.user),
    token: computed(() => authStore.token),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
    loginTime: computed(() => authStore.loginTime),
    expiresAt: computed(() => authStore.expiresAt),
    login: authStore.login,
    logout: authStore.logout,
    refreshAccessToken: authStore.refreshAccessToken,
    hasPermission: authStore.hasPermission,
    hasRole: authStore.hasRole,
    restoreSession: authStore.restoreSession,
  };
}
