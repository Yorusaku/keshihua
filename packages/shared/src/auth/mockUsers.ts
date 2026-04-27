/**
 * Mock 用户数据
 */

import type { User } from './types';

export const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: 'user-001',
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    email: 'admin@example.com',
    role: 'admin',
    permissions: [
      { resource: '*', actions: ['view', 'create', 'edit', 'delete', 'assign', 'close', 'export'] },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'user-002',
    username: 'zhangwork',
    password: '123456',
    name: '张工',
    email: 'zhang@example.com',
    role: 'device_engineer',
    department: '设备部',
    permissions: [
      { resource: 'agv', actions: ['view', 'edit'] },
      { resource: 'sensor', actions: ['view', 'edit'] },
      { resource: 'alert', actions: ['view', 'assign', 'close'] },
      { resource: 'report', actions: ['view', 'export'] },
      { resource: 'dashboard', actions: ['view'] },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'user-003',
    username: 'liwork',
    password: '123456',
    name: '李工',
    email: 'li@example.com',
    role: 'electrical_engineer',
    department: '电气部',
    permissions: [
      { resource: 'agv', actions: ['view'] },
      { resource: 'sensor', actions: ['view', 'edit'] },
      { resource: 'alert', actions: ['view', 'assign', 'close'] },
      { resource: 'report', actions: ['view'] },
      { resource: 'dashboard', actions: ['view'] },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'user-004',
    username: 'wangwork',
    password: '123456',
    name: '王工',
    email: 'wang@example.com',
    role: 'maintenance_technician',
    department: '维修部',
    permissions: [
      { resource: 'agv', actions: ['view'] },
      { resource: 'sensor', actions: ['view'] },
      { resource: 'alert', actions: ['view', 'assign', 'close'] },
      { resource: 'report', actions: ['view'] },
      { resource: 'dashboard', actions: ['view'] },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'user-005',
    username: 'viewer',
    password: '123456',
    name: '访客',
    email: 'viewer@example.com',
    role: 'viewer',
    permissions: [
      { resource: 'agv', actions: ['view'] },
      { resource: 'sensor', actions: ['view'] },
      { resource: 'alert', actions: ['view'] },
      { resource: 'report', actions: ['view'] },
      { resource: 'dashboard', actions: ['view'] },
    ],
    createdAt: Date.now(),
  },
];
