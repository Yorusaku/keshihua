/**
 * 错误收集器测试
 * 文件路径：packages/monitor/__tests__/plugins/error.test.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试目标：
 * - 手动触发 window.onerror，断言 reporter.report 被调用
 * - 触发 unhandledrejection，断言 reporter.report 被调用
 * - 模拟资源错误事件，断言 reporter.report 被调用
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupErrorCatch } from '../../src/plugins/error';

// ✅ Mock Reporter
const mockReporter = {
  report: vi.fn(),
};

// ✅ Mock PerformanceObserver
vi.stubGlobal('PerformanceObserver', class {
  observe = vi.fn();
  disconnect = vi.fn();
});

describe('Error Plugin - 错误收集器 (Green Light Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('JS Runtime Error (JS 运行时错误)', () => {
    it('window.onerror 应被设置', () => {
      setupErrorCatch(mockReporter);

      // ✅ window.onerror 应被设置
      expect(typeof window.onerror).toBe('function');
    });

    it('window.onerror 应调用 reporter.report', () => {
      setupErrorCatch(mockReporter);

      // ✅ 触发 error
      window.onerror?.('Test error', 'app.js', 10, 5, null);

      // ✅ reporter 应被调用
      expect(mockReporter.report).toHaveBeenCalled();
    });

    it('window.onerror 应构建正确的错误数据', () => {
      setupErrorCatch(mockReporter);

      window.onerror?.(
        'ReferenceError: foo is not defined',
        'app.js',
        20,
        10,
        new Error('foo is not defined')
      );

      const calledData = mockReporter.report.mock.calls[0][0];
      expect(calledData.type).toBe('error');
      expect(calledData.data.type).toBe('js');
      expect(calledData.data.message).toBe('ReferenceError: foo is not defined');
      expect(calledData.data.filename).toBe('app.js');
      expect(calledData.data.lineno).toBe(20);
      expect(calledData.data.colno).toBe(10);
    });
  });

  describe('Promise Rejection (Promise 异常)', () => {
    it('unhandledrejection 应被捕获', () => {
      setupErrorCatch(mockReporter);

      window.dispatchEvent(
        new PromiseRejectionEvent('unhandledrejection', {
          reason: new Error('Promise error'),
        })
      );

      expect(mockReporter.report).toHaveBeenCalled();
    });

    it('unhandledrejection 应调用 reporter.report', () => {
      setupErrorCatch(mockReporter);

      const error = new Error('Promise rejected');
      window.dispatchEvent(
        new PromiseRejectionEvent('unhandledrejection', {
          reason: error,
        })
      );

      const calledData = mockReporter.report.mock.calls[0][0];
      expect(calledData.data.message).toBe('Promise rejected');
      expect(calledData.data.error).toBe(error.stack);
    });
  });

  describe('Resource Load Error (资源加载错误)', () => {
    it('资源错误应被捕获', () => {
      setupErrorCatch(mockReporter);

      const img = document.createElement('img');
      img.src = 'invalid.jpg';
      img.dispatchEvent(new Event('error'));

      expect(mockReporter.report).toHaveBeenCalled();
    });

    it('资源错误应调用 reporter.report', () => {
      setupErrorCatch(mockReporter);

      const img = document.createElement('img');
      img.src = 'https://example.com/invalid.jpg';
      img.dispatchEvent(new Event('error'));

      const calledData = mockReporter.report.mock.calls[0][0];
      expect(calledData.data.type).toBe('resource');
      expect(calledData.data.message).toContain('Resource load failed');
      expect(calledData.data.filename).toBe('https://example.com/invalid.jpg');
    });

    it('非资源元素错误不应被捕获', () => {
      setupErrorCatch(mockReporter);

      const div = document.createElement('div');
      div.dispatchEvent(new Event('error'));

      expect(mockReporter.report).not.toHaveBeenCalled();
    });
  });
});
