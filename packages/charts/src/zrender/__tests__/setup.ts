/**
 * AgvRenderer 测试环境 Mock 配置
 * 文件路径：@packages/charts/src/zrender/__tests__/setup.ts
 * 阶段：🔴 红灯阶段（测试先行）
 * 
 * 📌 Mock 说明：
 * - mockZRender：Mock zrender.init，返回带有 add, render, dispose 的对象
 * - mockRequestAnimationFrame：Mock requestAnimationFrame / cancelAnimationFrame
 * - Mock 必须在 Vitest 的 setupFiles 中初始化
 */

// ✅ Mock zrender 模块（返回空方法对象）
const mockZRenderInstance = {
  add: vi.fn(),
  remove: vi.fn(),
  render: vi.fn(),
  dispose: vi.fn(),
  clear: vi.fn(),
};

const zrenderModule = {
  init: vi.fn(() => mockZRenderInstance),
  Circle: vi.fn(),
  Image: vi.fn(),
  Group: vi.fn(),
  Text: vi.fn(),
  LinearGradient: vi.fn(),
  RadialGradient: vi.fn(),
  Pattern: vi.fn(),
};

// ✅ Mock requestAnimationFrame / cancelAnimationFrame
let mockAnimationFrameId = 0;
const mockAnimationFrameCallbacks: Array<() => void> = [];

const mockRequestAnimationFrame = (callback: () => void): number => {
  mockAnimationFrameId += 1;
  mockAnimationFrameCallbacks.push(callback);
  return mockAnimationFrameId;
};

const mockCancelAnimationFrame = (id: number): void => {
  // 标记该 ID 的回调为已取消
  const index = mockAnimationFrameCallbacks.findIndex((_, i) => {
    // 这是一个简化的 Mock，实际测试中通过更严格的逻辑验证
    return true;
  });
  // 在真实实现中会从队列中移除对应 callback
};

// ✅ 执行所有已排队的回调（用于测试推进帧）
export const runAllMockFrameCallbacks = (): void => {
  const callbacks = [...mockAnimationFrameCallbacks];
  mockAnimationFrameCallbacks.length = 0; // 清空回调队列
  callbacks.forEach((callback) => callback());
};

// ✅ 全局注入 Mock（在 Vitest setupFiles 中调用）
export const setupMockZRender = (): void => {
  // Mock zrender
  vi.mock('zrender', () => zrenderModule);

  // Mock requestAnimationFrame
  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame as typeof cancelAnimationFrame;
};

// ✅ 清理 Mock
export const cleanupMockZRender = (): void => {
  vi.resetAllMocks();
  mockAnimationFrameId = 0;
  mockAnimationFrameCallbacks.length = 0;

  // 恢复全局函数
  global.requestAnimationFrame = window.requestAnimationFrame;
  global.cancelAnimationFrame = window.cancelAnimationFrame;
};
