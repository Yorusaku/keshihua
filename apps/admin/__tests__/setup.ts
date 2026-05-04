/**
 * 测试环境配置
 * 阶段：🟢 绿灯阶段（SensorTrend 测试）
 *
 * 📌 Mock 设置：
 * - @packages/shared：useSensorTrendQuery Hook
 * - @antv/s2：PivotSheet 类
 */

// ✅ 使用 manual mocks (mocks/@packages/shared.ts)
// 这样可以在模块导入之前就拦截
// 参考：https://vitest.dev/guide/mocking#manual-mocks

// ✅ Mock @antv/s2（绕过 JSDOM Canvas 崩溃）
vi.mock('@antv/s2', () => ({
  PivotSheet: vi.fn((container, dataConfig, options) => ({
    render: vi.fn(),
    destroy: vi.fn(),
    setDataCfg: vi.fn(),
    changeSheetSize: vi.fn(),
  })),
}));

if (typeof ResizeObserver === 'undefined') {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', MockResizeObserver as unknown as typeof ResizeObserver);
}
