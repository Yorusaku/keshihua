/**
 * Router 实例配置
 * 阶段：🟣 纠偏阶段（动态导入修复 HMR 死锁）
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layout/AdminLayout.vue';
import { AimOutlined } from '@ant-design/icons-vue';

/**
 * 静态路由配置
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/agv',
  },
  {
    path: '/agv',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'AgvList',
        // ✅ 核心修复：使用动态导入，彻底杜绝 undefined 导致白板！
        component: () => import('@/views/AgvList.vue'),
        meta: {
          title: 'AGV 车辆管理',
          icon: AimOutlined,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/agv',
  },
];

/**
 * Router 实例
 * @description 配置路由及其布局
 */
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
