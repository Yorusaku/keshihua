/**
 * queryClient 全局配置测试用例
 * 文件路径：packages/shared/src/network/__tests__/queryClient.test.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试说明：
 * - 验证 queryClient 的默认配置是否符合大屏场景需求
 * - 绿灯阶段：queryClient.ts 已实现，测试应通过
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { queryClient } from '../queryClient';

describe('queryClient - Global Configuration', () => {
  describe('Default Options Validation', () => {
    it('defaultOptions.queries.staleTime 应为 60000（1 分钟）', () => {
      const options = queryClient.getDefaultOptions();
      expect(options.queries?.staleTime).toBe(1000 * 60);
    });

    it('defaultOptions.queries.gcTime 应为 300000（5 分钟）', () => {
      const options = queryClient.getDefaultOptions();
      expect(options.queries?.gcTime).toBe(1000 * 60 * 5);
    });

    it('defaultOptions.queries.refetchOnWindowFocus 应为 false（禁用窗口聚焦刷新）', () => {
      const options = queryClient.getDefaultOptions();
      expect(options.queries?.refetchOnWindowFocus).toBe(false);
    });

    it('defaultOptions.queries.refetchOnReconnect 应为 false（禁用网络重连刷新）', () => {
      const options = queryClient.getDefaultOptions();
      expect(options.queries?.refetchOnReconnect).toBe(false);
    });

    it('defaultOptions.queries.retry 应为 2（失败重试 2 次）', () => {
      const options = queryClient.getDefaultOptions();
      expect(options.queries?.retry).toBe(2);
    });
  });
});
