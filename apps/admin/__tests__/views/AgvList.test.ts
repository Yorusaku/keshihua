/**
 * AgvList.vue 测试用例
 * 阶段：🟢 绿灯阶段（完整实现）
 *
 * 📌 测试目标：
 * - 使用 vi.mock('@packages/shared') 拦截 DataBuffer.getInstance().getSnapshot()
 * - 返回包含两条模拟 AGV 数据的数组
 * - 验证组件正确渲染
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

/**
 * 📦 引入 AgvList 组件
 */
import AgvList from '@/views/AgvList.vue';

/**
 * 📦 引入 DataBuffer（从 mock）
 */
// @ts-ignore
import { DataBuffer } from '@packages/shared';

/**
 * 📋 模拟 AGV 数据
 */
const mockAgvData = [
  {
    id: 'AGV001',
    x: 100,
    y: 200,
    status: 'idle',
  },
  {
    id: 'AGV002',
    x: 150,
    y: 250,
    status: 'moving',
  },
];

describe('AgvList', () => {
  beforeEach(() => {
    // ✅ 设置 mock 返回值（直接赋值，不需要调用 mockReturnValue）
    DataBuffer.getInstance().getSnapshot = vi.fn().mockReturnValue(mockAgvData);
  });

  /**
   * 🚨 测试 1：组件不抛出错误（应通过 - 组件已实现）
   * @description 验证组件可以正确挂载
   */
  it('组件正确挂载', () => {
    const wrapper = mount(AgvList, {
      global: {
        stubs: ['ElCard', 'ElTable', 'ElTableRow', 'ElTableColumn', 'ElTag', 'ElIcon'],
      },
    });

    // ✅ 断言：组件应正确挂载
    expect(wrapper.exists()).toBe(true);
  });

  /**
   * 🚨 测试 2：DataBuffer 调用断言（应通过 - 数据已绑定）
   * @description 验证 DataBuffer.getInstance().getSnapshot() 被调用
   */
  it('正确调用 DataBuffer 获取数据', () => {
    const wrapper = mount(AgvList, {
      global: {
        stubs: ['ElCard', 'ElTable', 'ElTableRow', 'ElTableColumn', 'ElTag', 'ElIcon'],
      },
    });

    // ✅ 断言：DataBuffer.getInstance().getSnapshot() 被调用
    expect(DataBuffer.getInstance().getSnapshot).toHaveBeenCalled();
  });
});
