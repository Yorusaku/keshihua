/**
 * Mock @antv/s2
 * 阶段：🟣 重构阶段（绕过 JSDOM Canvas 崩溃）
 */

export const PivotSheet = vi.fn((container, dataConfig, options) => {
  return {
    render: vi.fn(),
    destroy: vi.fn(),
    setDataCfg: vi.fn(),
  };
});
