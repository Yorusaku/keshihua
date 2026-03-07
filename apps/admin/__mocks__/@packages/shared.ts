/**
 * Mock @packages/shared
 * 阶段：🔴 红灯阶段（占位文件）
 */

export const DataBuffer = {
  getInstance: () => ({
    getSnapshot: vi.fn(),
  }),
};
