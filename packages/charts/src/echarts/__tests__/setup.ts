/**
 * Vite Test 环境配置
 * 文件路径：packages/charts/src/echarts/__tests__/setup.ts
 * 阶段：🔴 红灯阶段（传感器时序数据测试）
 *
 * 📌 配置说明：
 * - Vitest 全局 Mock 配置
 * - ECharts 和 @vueuse/core 的 Mock 实现
 * - ⚠️ 传感器时序数据测试使用 LTTB 降采样配置验证
 */

import { vi } from 'vitest';

// ✅ 全局 mock 实例，确保所有测试共享同一个 mock 对象
const mockSetOption = vi.fn();
const mockResize = vi.fn();
const mockDispose = vi.fn();

const mockChart = {
  setOption: mockSetOption,
  resize: mockResize,
  dispose: mockDispose,
};

const mockInit = vi.fn(() => mockChart);

// ✅ Mock echarts.graphic 用于 LinearGradient
const mockGraphic = {
  LinearGradient: vi.fn((x0: number, y0: number, x1: number, y1: number, stops: any[]) => ({
    x0,
    y0,
    x1,
    y1,
    stops,
  })),
};

/**
 * Mock ECharts 模块
 * @description 提供 echarts.init 的模拟实现
 * @remarks 🔴 红灯阶段：确保所有测试能正确拦截 init 调用
 */
vi.mock('echarts', () => {
  return {
    echarts: {
      init: mockInit,
      graphic: mockGraphic,
    },
    init: mockInit,
    graphic: mockGraphic,
  };
});

/**
 * Mock @vueuse/core 模块
 * @description 提供 useResizeObserver 的模拟实现
 * @remarks 🔴 红灯阶段：确保 resize 回调能被正确模拟
 */
vi.mock('@vueuse/core', () => {
  const mockResizeCallback = vi.fn();

  const mockUseResizeObserver = vi.fn((element, callback) => {
    // 保留回调以便在测试中手动触发
    mockResizeCallback.mockImplementation(callback);
    return {
      stop: vi.fn(),
    };
  });

  return {
    useResizeObserver: mockUseResizeObserver,
  };
});
