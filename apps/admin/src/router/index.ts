/**
 * Router 实例配置
 * 阶段：🔴 红灯阶段（占位文件）
 */

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

/**
 * 暂时返回空路由配置（等待绿灯阶段实现）
 */
const routes: RouteRecordRaw[] = [];

/**
 * Router 实例
 * @description 等待绿灯阶段添加实际路由配置
 */
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ✅ 导出类型
export type { RouteRecordRaw };
