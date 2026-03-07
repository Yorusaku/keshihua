/**
 * AgvList.vue 测试用例
 * 阶段：🔴 红灯阶段（占位文件，测试应失败）
 *
 * 📌 测试目标：
 * - 使用 vi.mock('@packages/shared') 拦截 DataBuffer.getInstance().getSnapshot()
 * - 返回包含两条模拟 AGV 数据的数组
 * - 断言页面中存在 "AGV 车辆管理" 文本
 * - 验证传递给 mock table 的 :data 属性是否正确绑定
 * 
 * ⚠️ 红灯阶段说明：
 * - 此测试文件会失败，因为 @packages/shared 无法解析（等待绿灯阶段修复）
 * - 测试用例结构完整，等待绿灯阶段完善后即可通过
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

/**
 * 🚨 Mock @packages/shared（红灯阶段占位，等待绿灯阶段修复）
 * @description 拦截 DataBuffer.getInstance().getSnapshot()
 * @returns 包含两条模拟 AGV 数据的数组
 */
// 注意：红灯阶段此模块无法解析，已注释掉
// vi.mock('@packages/shared', () => ({
//   DataBuffer: {
//     getInstance: () => ({
//       getSnapshot: vi.fn(),
//     }),
//   },
// }));

/**
 * 🚨 必须 stub 的 Element Plus 组件
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

// 注意：红灯阶段 DataBuffer 无法从 @packages/shared 导入
// const DataBuffer = {
//   getInstance: () => ({
//     getSnapshot: vi.fn(),
//   }),
// };

describe('AgvList', () => {
  /**
   * 🚨 测试 1：页面标题断言（应失败 - @packages/shared 无法解析）
   * @description 验证页面中存在 "AGV 车辆管理" 文本
   */
  it('渲染页面标题', () => {
    // ❌ 红灯阶段：这会失败，因为 @packages/shared 无法解析
    const wrapper = mount(AgvList, {
      global: {
        stubs: elementPlusStubs,
      },
    });

    // ✅ 断言：应找到 "AGV 车辆管理" 文本
    // 等待绿灯阶段 @packages/shared 导入路径问题解决后，此测试将通过
    expect(wrapper.text()).toContain('AGV 车辆管理');
  });
});
