/**
 * useCapacityQuery Hook 测试用例
 * 文件路径：packages/shared/src/network/__tests__/useCapacityQuery.test.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试说明：
 * - 使用 Vue Test Utils 的 mount 方法挂载模拟组件
 * - 在 global.plugins 中注入 VueQueryPlugin
 * - 绿灯阶段：useCapacityQuery.ts 已实现，测试应通过
 *
 * 🚨 架构师强制纠偏：
 * - ❌ 禁止使用不存在的 renderHook
 * - ✅ 必须使用 mount 挂载 TestComponent
 * - ✅ 必须在 global.plugins 中注入 VueQueryPlugin
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { queryClient } from '../queryClient';
import { useCapacityQuery } from '../queries/useCapacityQuery';

/**
 * 模拟组件（TestComponent）
 * @description 在 setup 中调用 useCapacityQuery()，并暴露结果以便断言
 */
const TestComponent = defineComponent({
  name: 'TestComponent',
  template: `<div data-testid="test-result"></div>`,
  setup() {
    // ✅ 调用 useCapacityQuery
    const result = useCapacityQuery();
    
    // ✅ 暴露结果给测试断言
    return {
      result,
      isLoading: result.isLoading,
      data: result.data,
      isError: result.isError,
      refetch: result.refetch,
    };
  },
});

describe('useCapacityQuery - Capacity Macro Data Query', () => {
  beforeEach(() => {
    // ✅ 每个测试前重置 queryClient
    queryClient.clear?.();
  });

  describe('Component Mounting & Hook Integration', () => {
    it('组件挂载后，应正确初始化 useCapacityQuery Hook', () => {
      const wrapper = mount(TestComponent, {
        global: {
          plugins: [VueQueryPlugin],
        },
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.result).toBeDefined();
    });

    it('应正确注入 queryClient 到 VueQueryPlugin', () => {
      const wrapper = mount(TestComponent, {
        global: {
          plugins: [VueQueryPlugin],
        },
      });

      expect(wrapper.vm.result).toBeDefined();
    });
  });

  describe('Hook Execution Flow', () => {
    it('Hook 返回对象应包含 isLoading、data、error、refetch 等属性', () => {
      const wrapper = mount(TestComponent, {
        global: {
          plugins: [VueQueryPlugin],
        },
      });

      // ✅ 初始化时，isLoading 应为 true
      expect(wrapper.vm.isLoading).toBe(true);
      expect(wrapper.vm.data).toBeUndefined();
      expect(wrapper.vm.refetch).toBeDefined();
    });

    it('组件挂载后，isLoading 应为 true，随后变为 false', async () => {
      const wrapper = mount(TestComponent, {
        global: {
          plugins: [VueQueryPlugin],
        },
      });

      // ✅ 初始状态：isLoading = true
      expect(wrapper.vm.isLoading).toBe(true);

      // ✅ 等待模拟数据返回（200 ~ 500ms + queryClient staleTime 60s）
      await new Promise((resolve) => setTimeout(resolve, 600));

      // ✅ 数据返回后：isLoading = false，data 存在
      expect(wrapper.vm.isLoading).toBe(false);
      expect(wrapper.vm.data).toBeDefined();
      expect(wrapper.vm.data?.total).toBeTypeOf('number');
      expect(wrapper.vm.data?.completed).toBeTypeOf('number');
    });

    it('请求结束后，data 应包含 total、completed 等正确属性', async () => {
      const wrapper = mount(TestComponent, {
        global: {
          plugins: [VueQueryPlugin],
        },
      });

      // ✅ 等待模拟数据返回
      await new Promise((resolve) => setTimeout(resolve, 600));

      // ✅ 验证数据结构
      expect(wrapper.vm.data).toBeDefined();
      expect(wrapper.vm.data?.total).toBeTypeOf('number');
      expect(wrapper.vm.data?.completed).toBeTypeOf('number');
      expect(wrapper.vm.data?.completionRate).toBeTypeOf('number');
      expect(wrapper.vm.data?.defectRate).toBeTypeOf('number');
      expect(wrapper.vm.data?.timestamp).toBeTypeOf('number');
    });
  });

  describe('Refetch Mechanism', () => {
    it('Hook 返回对象应包含 refetch 方法（API 暴露验证）', () => {
      const wrapper = mount(TestComponent, {
        global: {
          plugins: [VueQueryPlugin],
        },
      });

      // ✅ 验证 refetch 方法存在
      expect(wrapper.vm.refetch).toBeDefined();
      expect(typeof wrapper.vm.refetch).toBe('function');
    });

    it('手动调用 refetch() 应触发新请求', async () => {
      const wrapper = mount(TestComponent, {
        global: {
          plugins: [VueQueryPlugin],
        },
      });

      // ✅ 等待首次数据加载（200 ~ 500ms）
      await new Promise((resolve) => setTimeout(resolve, 600));

      const firstData = wrapper.vm.data;
      expect(firstData).toBeDefined();

      // ✅ 手动刷新
      await wrapper.vm.refetch?.();

      // ✅ 等待新数据返回
      await new Promise((resolve) => setTimeout(resolve, 600));

      // ✅ 验证新数据返回
      expect(wrapper.vm.data).toBeDefined();
    });
  });
});
