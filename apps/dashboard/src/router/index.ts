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
import Dashboard from '@/views/Dashboard.vue';

/**
 * 路由配置
 * @description 配置默认路由，MVP 阶段暂不使用路由懒加载
 */
export const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
];

/**
 * 创建 Vue Router 实例
 * @returns Vue Router 实例
 */
export const router = createRouter({
  // ✅ 使用 history 模式（ cleaner URL）
  history: createWebHistory(),
  routes,
});
