/**
 * Router 实例
 * 文件职责：装配 Admin 路由和守卫。
 */

import { createRouter, createWebHistory } from 'vue-router';
import { adminRoutes } from './routes';
import { setupRouterGuards } from './guards';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: adminRoutes,
});

setupRouterGuards(router);
