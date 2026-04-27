import type { Router, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from './store';
import type { UserRole, PermissionAction } from './types';

export interface RouteMetaAuth {
  requiresAuth?: boolean;
  roles?: UserRole[];
  permissions?: Array<{ resource: string; action: PermissionAction }>;
}

export function setupAuthGuard(router: Router): void {
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();
    const meta = to.meta as RouteMetaAuth;

    if (!meta.requiresAuth) {
      return next();
    }

    if (!authStore.isAuthenticated) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
    }

    if (meta.roles && !meta.roles.some(role => authStore.hasRole(role))) {
      return next({ path: '/403' });
    }

    if (meta.permissions) {
      const hasAllPermissions = meta.permissions.every(
        ({ resource, action }) => authStore.hasPermission(resource, action)
      );
      if (!hasAllPermissions) {
        return next({ path: '/403' });
      }
    }

    next();
  });
}
