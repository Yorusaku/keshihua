/**
 * 性能收集器测试
 * 文件路径：packages/monitor/__tests__/plugins/performance.test.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试目标：
 * - 模拟 PerformanceObserver，验证 observe 是否被调用
 * - 模拟 FCP entry，验证 report 被调用并紧接着调用 disconnect
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { setupPerformanceCatch } from '../../src/plugins/performance';

// ✅ Mock PerformanceObserver
class MockPerformanceObserver {
  public observe = vi.fn();
  public disconnect = vi.fn();
  private callback: (list: any) => void;

  constructor(callback: (list: any) => void) {
    this.callback = callback;
  }
}

beforeEach(() => {
  vi.stubGlobal('PerformanceObserver', MockPerformanceObserver);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Performance Plugin - 性能收集器 (Green Light Phase)', () => {
  const mockReporter = {
    report: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Observer Setup (观察器设置)', () => {
    it('应创建 PerformanceObserver', () => {
      setupPerformanceCatch(mockReporter);

      // ✅ PerformanceObserver 应被调用
      expect(MockPerformanceObserver).toHaveBeenCalled();
    });

    it('应调用 observe 方法监听 paint', () => {
      setupPerformanceCatch(mockReporter);

      const observer = (window as any).PerformanceObserver.prototype;
      expect(observer.observe).toHaveBeenCalled();
    });

    it('observe 应配置 entryTypes: [paint]', () => {
      setupPerformanceCatch(mockReporter);

      const observer = (window as any).PerformanceObserver.prototype;
      expect(observer.observe).toHaveBeenCalledWith({
        entryTypes: ['paint'],
      });
    });
  });

  describe('FCP Collection (FCP 采集)', () => {
    it('应触发 report 上报 FCP 数据', () => {
      setupPerformanceCatch(mockReporter);

      const observer = (window as any).PerformanceObserver.prototype;

      // ✅ 模拟 FCP entry
      const mockEntry = {
        name: 'first-contentful-paint',
        startTime: 123.45,
      };

      // ✅ 模拟 observer 回调
      observer.callback({
        getEntries: () => [mockEntry],
      });

      expect(mockReporter.report).toHaveBeenCalled();
    });

    it('应上报正确的 FCP 数据', () => {
      setupPerformanceCatch(mockReporter);

      const observer = (window as any).PerformanceObserver.prototype;

      const mockEntry = {
        name: 'first-contentful-paint',
        startTime: 123.45,
      };

      observer.callback({
        getEntries: () => [mockEntry],
      });

      const calledData = mockReporter.report.mock.calls[0][0];
      expect(calledData.type).toBe('performance');
      expect(calledData.data.name).toBe('FCP');
      expect(calledData.data.value).toBe(123.45);
    });

    it('应调用 disconnect 停止监听', () => {
      setupPerformanceCatch(mockReporter);

      const observer = (window as any).PerformanceObserver.prototype;

      const mockEntry = {
        name: 'first-contentful-paint',
        startTime: 123.45,
      };

      observer.callback({
        getEntries: () => [mockEntry],
      });

      // ✅ FCP 上报后应立即 disconnect
      expect(observer.disconnect).toHaveBeenCalled();
    });

    it('非 FCP entry 不应触发 report', () => {
      setupPerformanceCatch(mockReporter);

      const observer = (window as any).PerformanceObserver.prototype;

      const mockEntry = {
        name: 'first-paint', // ✅ 非 FCP
        startTime: 50.0,
      };

      observer.callback({
        getEntries: () => [mockEntry],
      });

      expect(mockReporter.report).not.toHaveBeenCalled();
    });

    it('多个 entry 仅处理 FCP', () => {
      setupPerformanceCatch(mockReporter);

      const observer = (window as any).PerformanceObserver.prototype;

      const mockEntries = [
        { name: 'first-paint', startTime: 50.0 },
        { name: 'first-contentful-paint', startTime: 123.45 },
        { name: 'first-paint', startTime: 51.0 },
      ];

      observer.callback({
        getEntries: () => mockEntries,
      });

      // ✅ 仅 FCP 触发 report
      expect(mockReporter.report).toHaveBeenCalledTimes(1);
    });
  });
});
