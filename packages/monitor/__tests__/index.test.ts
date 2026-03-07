/**
 * SDK 入口测试
 * 文件路径：packages/monitor/__tests__/index.test.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试目标：
 * - 验证 initMonitor 是否实例化 Reporter
 * - 验证 initMonitor 是否调用 plugin 的 setup 方法
 * - 验证 close 方法是否调用 Reporter.close
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { initMonitor } from '../src/index';

// ✅ Mock Reporter
const mockReporter = {
  report: vi.fn(),
  close: vi.fn(),
};

const MockReporterClass = vi.fn().mockImplementation(() => mockReporter);

// ✅ Mock plugins
const mockSetupErrorCatch = vi.fn();
const mockSetupPerformanceCatch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mock('../src/transport', () => ({
    Reporter: MockReporterClass,
  }));

  vi.mock('../src/plugins/error', () => ({
    setupErrorCatch: mockSetupErrorCatch,
  }));

  vi.mock('../src/plugins/performance', () => ({
    setupPerformanceCatch: mockSetupPerformanceCatch,
  }));
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('initMonitor - SDK 入口 (Green Light Phase)', () => {
  describe('Monitor Initialization (SDK 初始化)', () => {
    it('应创建 Reporter 实例', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
        performance: true,
      };

      const instance = initMonitor(config);

      expect(MockReporterClass).toHaveBeenCalled();
      expect(MockReporterClass).toHaveBeenCalledWith({
        dsn: '/api/report',
        appId: 'admin',
        debug: false,
        flushInterval: undefined,
        maxQueueSize: undefined,
      });
    });

    it('应调用 setupErrorCatch', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
        performance: true,
      };

      initMonitor(config);

      expect(mockSetupErrorCatch).toHaveBeenCalled();
    });

    it('setupErrorCatch 应传递 reporter 实例', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
      };

      initMonitor(config);

      const reporter = MockReporterClass.mock.instances[0];
      expect(mockSetupErrorCatch).toHaveBeenCalledWith(reporter, undefined);
    });

    it('setupErrorCatch 应传递 withStack 选项', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
        error: {
          withStack: true,
        },
      };

      initMonitor(config);

      const reporter = MockReporterClass.mock.instances[0];
      expect(mockSetupErrorCatch).toHaveBeenCalledWith(reporter, {
        withStack: true,
      });
    });
  });

  describe('Performance Collection (性能收集)', () => {
    it('默认应调用 setupPerformanceCatch', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
      };

      initMonitor(config);

      expect(mockSetupPerformanceCatch).toHaveBeenCalled();
    });

    it('performance: false 应不调用 setupPerformanceCatch', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
        performance: false,
      };

      initMonitor(config);

      expect(mockSetupPerformanceCatch).not.toHaveBeenCalled();
    });

    it('performance: true 应调用 setupPerformanceCatch', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
        performance: true,
      };

      initMonitor(config);

      expect(mockSetupPerformanceCatch).toHaveBeenCalled();
    });

    it('setupPerformanceCatch 应传递 reporter 实例', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
      };

      initMonitor(config);

      const reporter = MockReporterClass.mock.instances[0];
      expect(mockSetupPerformanceCatch).toHaveBeenCalledWith(reporter);
    });
  });

  describe('Close Method (关闭方法)', () => {
    it('close 方法应调用 Reporter.close', () => {
      const instance = initMonitor({
        dsn: '/api/report',
        appId: 'admin',
      });

      instance.close();

      expect(mockReporter.close).toHaveBeenCalled();
    });
  });

  describe('Debug Mode (调试模式)', () => {
    it('debug: true 应传递给 Reporter', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
        debug: true,
      };

      initMonitor(config);

      expect(MockReporterClass).toHaveBeenCalledWith({
        dsn: '/api/report',
        appId: 'admin',
        debug: true,
        flushInterval: undefined,
        maxQueueSize: undefined,
      });
    });
  });

  describe('Custom Reporter Options (自定义Reporter选项)', () => {
    it('应支持自定义 flushInterval', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
        reporter: {
          flushInterval: 3000,
        },
      };

      initMonitor(config);

      expect(MockReporterClass).toHaveBeenCalledWith({
        dsn: '/api/report',
        appId: 'admin',
        flushInterval: 3000,
        maxQueueSize: undefined,
        debug: undefined,
      });
    });

    it('应支持自定义 maxQueueSize', () => {
      const config = {
        dsn: '/api/report',
        appId: 'admin',
        reporter: {
          maxQueueSize: 50,
        },
      };

      initMonitor(config);

      expect(MockReporterClass).toHaveBeenCalledWith({
        dsn: '/api/report',
        appId: 'admin',
        flushInterval: undefined,
        maxQueueSize: 50,
        debug: undefined,
      });
    });
  });
});
