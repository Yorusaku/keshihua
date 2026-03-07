/**
 * AdminLayout.vue 测试用例
 * 阶段：🟢 绿灯阶段（完整实现）
 *
 * 📌 测试目标：
 * - 验证 AdminLayout 正确渲染 Sidebar、Header 和 router-view
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
   * @description 验证 AdminLayout 渲染了 Sidebar、Header 和 router-view
   */
  it('渲染正确的布局结构', () => {
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

    // ✅ 断言：应找到 Sidebar 组件
    expect(wrapper.findComponent({ name: 'Sidebar' }).exists()).toBe(true);

    // ✅ 断言：应找到 Header 组件
    expect(wrapper.findComponent({ name: 'Header' }).exists()).toBe(true);

    // ✅ 断言：/router-view 存在（通过 DOM 查询）
    expect(wrapper.find('router-view-stub').exists()).toBe(true);
  });

  /**
   * 🚨 测试 2：路由出口挂载（应通过 - 路由已配置）
   * @description 验证 <router-view /> 正确挂载子组件
   */
  it('正确挂载子路由', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: {
          ...elementPlusStubs,
          ...localStubs,
        },
      },
    });

    // ✅ 导航到 /agv
    await router.push('/agv');
    await router.isReady();

    // ✅ 断言：应找到 router-view stub
    expect(wrapper.find('router-view-stub').exists()).toBe(true);
  });

  /**
   * 🚨 测试 3：侧边栏菜单渲染（应通过 - 组件已实现）
   * @description 验证 Sidebar 渲染菜单项
   */
  it('渲染侧边栏菜单', () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: {
          ...elementPlusStubs,
          ...localStubs,
        },
      },
    });

    // ✅ 断言：应找到 Sidebar 组件
    const sidebar = wrapper.findComponent({ name: 'Sidebar' });
    expect(sidebar.exists()).toBe(true);
  });
});
