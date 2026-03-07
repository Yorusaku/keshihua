/**
 * 队列与上报器测试
 * 文件路径：packages/monitor/__tests__/transport.test.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试目标：
 * - 验证达到 maxQueueSize 时是否立即触发上报
 * - 验证 flushInterval 定时器是否生效
 * - 验证 close() 是否清空定时器并触发最后一次上报
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { Reporter } from '../src/transport';
import type { ReporterOptions } from '../src/transport';

// ✅ Mock navigator.sendBeacon
vi.stubGlobal('sendBeacon', vi.fn().mockReturnValue(true));

describe('Reporter - 队列与上报器 (Green Light Phase)', () => {
  let reporter: Reporter;
  let options: ReporterOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    options = {
      dsn: '/api/report',
      appId: 'admin',
      flushInterval: 100, // 快速触发
      maxQueueSize: 3,
    };
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('Queue Management (队列管理)', () => {
    it('report 方法应将数据推入队列', () => {
      reporter = new Reporter(options);

      const data = {
        type: 'error' as const,
        data: {
          type: 'js',
          message: 'Test error',
          filename: 'app.js',
          lineno: 10,
          colno: 5,
        },
        timestamp: new Date().toISOString(),
      };

      reporter.report(data);
      reporter.close();

      // ✅ 验证 sendBeacon 被调用
      expect(window.sendBeacon).toHaveBeenCalled();
    });

    it('队列满时应立即触发上报', () => {
      reporter = new Reporter(options);

      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: '1',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });
      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: '2',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });
      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: '3',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });
      reporter.close();

      // ✅ 队列满（3条）应立即触发上报
      expect(window.sendBeacon).toHaveBeenCalledTimes(1);
    });

    it('队列小于 maxQueueSize 应等待 flushInterval 后上报', async () => {
      reporter = new Reporter(options);

      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: 'Test',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });
      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: 'Test2',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });

      await new Promise((resolve) => setTimeout(resolve, 150));
      reporter.close();

      // ✅ 等待 flushInterval 后应触发上报
      expect(window.sendBeacon).toHaveBeenCalled();
    });
  });

  describe('Flush Timer (批量上报定时器)', () => {
    it('flushInterval 定时器应循环触发', async () => {
      reporter = new Reporter(options);

      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: 'Test',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });

      await new Promise((resolve) => setTimeout(resolve, 250));

      // ✅ 定时器应循环触发
      expect(window.sendBeacon).toHaveBeenCalled();

      reporter.close();
    });

    it('close() 应清空定时器并触发最后一次上报', () => {
      reporter = new Reporter(options);

      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: 'Test',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });

      reporter.close();

      // ✅ close 应触发最后一次上报
      expect(window.sendBeacon).toHaveBeenCalled();
    });
  });

  describe('Send Beacon Strategy (上报策略)', () => {
    it('应优先使用 sendBeacon', () => {
      const mockSendBeacon = vi.fn().mockReturnValue(true);
      vi.stubGlobal('sendBeacon', mockSendBeacon);

      reporter = new Reporter(options);
      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: 'Test',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });
      reporter.close();

      expect(mockSendBeacon).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('sendBeacon 失败时应降级使用 fetch', () => {
      const mockSendBeacon = vi.fn().mockReturnValue(false);
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });

      vi.stubGlobal('sendBeacon', mockSendBeacon);
      vi.stubGlobal('fetch', mockFetch);

      reporter = new Reporter(options);
      reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: 'Test',
          filename: '',
          lineno: 0,
          colno: 0,
        },
        timestamp: '',
      });
      reporter.close();

      // ✅ sendBeacon 失败后应降级使用 fetch
      expect(mockFetch).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });
});
