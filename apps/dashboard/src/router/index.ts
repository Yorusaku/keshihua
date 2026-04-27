/**
 * Vue Router 路由配置
 * 文件路径：apps/dashboard/src/router/index.ts
 * 阶段：🏁 终极组装（应用启动）
 * 
 * 📌 路由说明：
 * - 采用静态 import（MVP 阶段为极速首屏加载）
 * - 默认路由 '/' 指向 Dashboard.vue
 */

import { createRouter, createWebHistory } from 'vue-router';
import { setupAuthGuard } from '@packages/shared';
import Dashboard from '@/views/Dashboard.vue';

export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      permissions: [{ resource: 'dashboard', action: 'view' }],
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupAuthGuard(router);
