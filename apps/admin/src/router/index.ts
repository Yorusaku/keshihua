/**
 * Router 实例配置
 * 阶段：🟣 精简重构（按需加载）
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { AdminLayout } from '@/layout';
import { AgvList } from '@/views';
// ✅ 只按需引入用到的图标
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
        component: AgvList,
        meta: {
          title: 'AGV 车辆管理',
          // ✅ 直接把组件对象传给 meta
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
