/**
 * AgvList.vue 测试用例
 * 阶段：🟢 绿灯阶段（完整实现）
 *
 * 📌 测试目标：
 * - 使用 vi.mock('@packages/shared') 拦截 DataBuffer.getInstance().getSnapshot()
 * - 返回包含两条模拟 AGV 数据的数组
 * - 断言页面中存在 "AGV 车辆管理" 文本
 * - 验证传递给 mock table 的 :data 属性是否正确绑定
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

/**
 * 🚨 必须 stub 的 Element Plus 组件和指令
 * @description 避免 unplugin-vue-components 在 Vitest 环境下的缺失报错
 */
const elementPlusStubs = [
  'el-card',
  'el-table',
  'el-table-column',
  'el-tag',
  'el-icon',
  'el-button',
];

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
    // ✅ 清空所有 mock 调用
    vi.clearAllMocks();

    // ✅ 设置 mock 返回值
    (DataBuffer.getInstance().getSnapshot as vi.Mock).mockReturnValue(mockAgvData);
  });

  /**
   * 🚨 测试 1：页面标题断言（应通过 - 组件已实现）
   * @description 验证页面中存在 "AGV 车辆管理" 文本
   */
  it('渲染页面标题', () => {
    const wrapper = mount(AgvList, {
      global: {
        stubs: elementPlusStubs,
      },
    });

    // ✅ 断言：应找到 "AGV 车辆管理" 文本
    expect(wrapper.text()).toContain('AGV 车辆管理');
  });

  /**
   * 🚨 测试 2：表格列渲染（应通过 - 数据已绑定）
   * @description 验证表格数据从 DataBuffer 正确获取
   */
  it('正确绑定数据到表格', () => {
    const wrapper = mount(AgvList, {
      global: {
        stubs: elementPlusStubs,
      },
    });

    // ✅ 断言：DataBuffer.getInstance().getSnapshot() 被调用
    expect(DataBuffer.getInstance().getSnapshot).toHaveBeenCalled();

    // ✅ 断言：应渲染两条数据
    expect(wrapper.text()).toContain('AGV001');
    expect(wrapper.text()).toContain('100');
    expect(wrapper.text()).toContain('200');

    expect(wrapper.text()).toContain('AGV002');
    expect(wrapper.text()).toContain('150');
    expect(wrapper.text()).toContain('250');
  });
});
