/**
 * 测试环境初始化
 * 文件路径：packages/monitor/__tests__/setup.ts
 * 阶段：🔴 红灯阶段（测试先行）
 */

import { vi } from 'vitest';

beforeAll(() => {
  // Mock PerformanceObserver
  class MockPerformanceObserver {
    observe = vi.fn();
    disconnect = vi.fn();
  }

  vi.stubGlobal('PerformanceObserver', MockPerformanceObserver);

  // Mock navigator.sendBeacon
  vi.stubGlobal('sendBeacon', vi.fn().mockReturnValue(true));

  // Mock fetch
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
  }));
});

afterEach(() => {
  vi.clearAllMocks();
});
