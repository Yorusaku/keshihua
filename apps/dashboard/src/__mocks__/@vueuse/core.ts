/**
 * Mock @vueuse/core
 * 文件路径：apps/dashboard/src/__mocks__/@vueuse/core.ts
 * 阶段：🏁 终极组装（应用启动）
 * 说明：Mock useElementSize 以避免测试时的 document 依赖
 */

export const useElementSize = vi.fn((ref, options) => {
  return {
    width: { value: 1920 },
    height: { value: 1080 },
  };
});
