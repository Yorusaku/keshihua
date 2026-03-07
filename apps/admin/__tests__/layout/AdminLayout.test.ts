/**
 * AdminLayout.vue 测试用例
 * 阶段：🔴 红灯阶段（占位文件，测试应失败）
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
  'el-card',
  'el-table',
  'el-table-column',
  'el-tag',
];

describe('AdminLayout', () => {
  let router;

  beforeEach(() => {
    // 创建空路由（红灯阶段）
    router = createRouter({
      history: createWebHistory(),
      routes: [],
    });
  });

  /**
   * 🚨 测试 1：布局结构断言（应失败 - 组件未Stub）
   * @description 验证 AdminLayout 渲染了 Sidebar、Header 和 router-view
   */
  it('渲染正确的布局结构', () => {
    // ❌ 红灯阶段：这会失败，因为 Sidebar 组件没有正确 stub
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: elementPlusStubs,
      },
    });

    // ✅ 断言：应找到 Sidebar 组件
    expect(wrapper.findComponent({ name: 'Sidebar' }).exists()).toBe(true);

    // ✅ 断言：应找到 Header 组件
    expect(wrapper.findComponent({ name: 'Header' }).exists()).toBe(true);

    // ✅ 断言：应找到 router-view
    expect(wrapper.findComponent('router-view').exists()).toBe(true);
  });

  /**
   * 🚨 测试 2：路由出口挂载（应失败 - 空路由）
   * @description 验证 <router-view /> 正确挂载子组件
   */
  it('正确挂载子路由', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: elementPlusStubs,
      },
    });

    // ❌ 红灯阶段：访问 /agv 会跳转失败（路由未定义）
    await router.push('/agv');
    await router.isReady();

    // ✅ 断言：应找到路由出口
    expect(wrapper.findComponent('router-view').exists()).toBe(true);
  });

  /**
   * 🚨 测试 3：侧边栏菜单渲染（应失败 - 组件未实现）
   * @description 验证 Sidebar 渲染菜单项
   */
  it('渲染侧边栏菜单', () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: elementPlusStubs,
      },
    });

    // ❌ 红灯阶段：菜单项尚未实现
    const sidebar = wrapper.findComponent({ name: 'Sidebar' });
    expect(sidebar.exists()).toBe(true);
    expect(sidebar.text()).toContain('首页');
  });
});
