/**
 * Admin 路由定义
 * 文件职责：提供最小后台三类页面路由，并保留深链上下文参数。
 */

import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layout/AdminLayout.vue';

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/agv',
  },
  {
    path: '/agv',
    component: AdminLayout,
    meta: {
      title: 'AGV 管理',
      navKey: 'agv',
    },
    children: [
      {
        path: '',
        name: 'AdminAgvList',
        component: () => import('@/views/AgvList.vue'),
        meta: {
          title: 'AGV 管理',
          navKey: 'agv',
          weight: 1,
        },
      },
      {
        path: 'sensor',
        name: 'AdminSensorTrend',
        component: () => import('@/views/SensorTrend.vue'),
        meta: {
          title: '传感器策略',
          navKey: 'sensor',
          weight: 2,
        },
      },
      {
        path: 'report',
        name: 'AdminCapacityReport',
        component: () => import('@/views/CapacityReport.vue'),
        meta: {
          title: '产能报表',
          navKey: 'report',
          weight: 3,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/agv',
  },
];
