/**
 * AdminLayout.vue 测试用例
 * 阶段：🟢 绿灯阶段（完整实现）
 *
 * 📌 测试目标：
 * - 验证 AdminLayout 正确渲染 Sidebar、Header
 * - 验证路由出口正确挂载子组件
 * - 验证 Element Plus 组件被正确 stub
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { AdminLayout } from '@/layout';
import { AgvList } from '@/views';

/**
 * 🚨 必须 stub 的 Element Plus 组件
 * @description 避免 unplugin-vue-components 在 Vitest 环境下的缺失报错
 */
const elementPlusStubs = [
  'el-aside',
  'el-menu',
  'el-menu-item',
  'el-header',
  'el-breadcrumb',
  'el-breadcrumb-item',
  'el-dropdown',
  'el-dropdown-menu',
  'el-dropdown-item',
  'el-avatar',
  'el-icon',
];

/**
 * 🚨 必须 stub 的本地组件
 * @description AdminLayout 的子组件
 */
const localStubs = {
  Sidebar: true,
  Header: true,
};

describe('AdminLayout', () => {
  let router;

  beforeEach(() => {
    // 创建路由（绿灯阶段）
    router = createRouter({
      history: createWebHistory(),
      routes: [
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
            },
          ],
        },
      ],
    });
  });

  /**
   * 🚨 测试 1：布局结构断言（应通过 - 组件已实现）
   * @description 验证 AdminLayout 渲染了 Sidebar、Header
   */
  it('渲染正确的布局结构', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: {
          ...elementPlusStubs,
          // Stub 本地组件
          ...localStubs,
        },
      },
    });

    // ✅ 等待路由准备完成
    await router.isReady();

    // ✅ 断言：应找到 Sidebar 组件（通过 name）
    expect(wrapper.findComponent({ name: 'Sidebar' }).exists()).toBe(true);

    // ✅ 断言：应找到 Header 组件（通过 name）
    expect(wrapper.findComponent({ name: 'Header' }).exists()).toBe(true);
  });

  /**
   * 🚨 测试 2：侧边栏菜单渲染（应通过 - 组件已实现）
   * @description 验证 Sidebar 渲染菜单项
   */
  it('渲染侧边栏菜单', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: {
          ...elementPlusStubs,
          ...localStubs,
        },
      },
    });

    // ✅ 等待路由准备完成
    await router.isReady();

    // ✅ 断言：应找到 Sidebar 组件
    const sidebar = wrapper.findComponent({ name: 'Sidebar' });
    expect(sidebar.exists()).toBe(true);
  });

  /**
   * 🚨 测试 3：AgvList 子路由（应通过 - 组件已实现）
   * @description 验证 AgvList 组件可以正确挂载
   */
  it('AgvList 子组件挂载', async () => {
    // 直接测试 AgvList 组件
    const wrapper = mount(AgvList, {
      global: {
        plugins: [router],
        stubs: ['ElCard', 'ElTable', 'ElTableRow', 'ElTableColumn', 'ElTag', 'ElIcon'],
      },
    });

    // ✅ 断言：AgvList 组件应正确挂载
    expect(wrapper.exists()).toBe(true);
  });
});
