/**
 * AgvList.vue 测试用例
 * 阿段：🔴 红灯阶段（测试先行）
 *
 * 📌 测试目标：
 * - 使用 vi.mock('@packages/shared') 拦截 useAgvListQuery Hook
 * - 测试组件挂载不抛出异常
 * - 红灯阶段：AgvList.vue 未实现，测试应全部失败（验证占位组件）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

/**
 * 📦 Mock @packages/shared - 拦截 useAgvListQuery
 */
const mockQueryResult = {
  data: { total: 0, list: [] },
  isLoading: true,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@packages/shared', () => ({
  useAgvListQuery: vi.fn(() => mockQueryResult),
  fetchAgvList: vi.fn(),
}));

describe('AgvList - AGV List Page (Red Light Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Mounting (Red Light Phase)', () => {
    it('空占位组件挂载不抛出异常', async () => {
      // ✅ 导入 AgvList 组件（红灯阶段：空占位）
      const AgvListComponent = await import('@/views/AgvList.vue');
      
      // ✅ 预期：组件挂载时不会抛出错误（即使未实现业务逻辑）
      expect(() => {
        mount(AgvListComponent.default, {
          global: {
            stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
          },
        });
      }).not.toThrow();
    });

    it('组件应包含占位 template', async () => {
      const AgvListComponent = await import('@/views/AgvList.vue');
      
      const wrapper = mount(AgvListComponent.default, {
        global: {
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 预期：组件存在
      expect(wrapper.exists()).toBe(true);
    });
  });
});
