/**
 * Mock @packages/shared
 * 阶段：🟢 绿灯阶段（完整实现）
 *
 * 📌 Mock 策略：
 * - 拦截 DataBuffer.getInstance().getSnapshot()
 * - 返回模拟 AGV 数据数组
 */

export const DataBuffer = {
  getInstance: () => ({
    getSnapshot: vi.fn().mockReturnValue([
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
    ]),
  }),
};
