/**
 * Admin 路由定义
 * 文件职责：提供最小后台三类页面路由，并保留深链上下文参数。
 */

import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layout/AdminLayout.vue';

export const adminRoutes: RouteRecordRaw[] = [
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
    redirect: '/agv',
  },
  {
    path: '/agv',
    component: AdminLayout,
    meta: {
      title: 'AGV 管理',
      navKey: 'agv',
      requiresAuth: true,
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
          permissions: [{ resource: 'agv', action: 'view' }],
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
          permissions: [{ resource: 'sensor', action: 'view' }],
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
          permissions: [{ resource: 'report', action: 'view' }],
        },
      },
      {
        path: 'alert-center',
        name: 'AdminAlertCenter',
        component: () => import('@/views/AlertCenter.vue'),
        meta: {
          title: '告警处理中心',
          navKey: 'alert-center',
          weight: 4,
          permissions: [{ resource: 'alert', action: 'view' }],
        },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/403.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/agv',
  },
];
