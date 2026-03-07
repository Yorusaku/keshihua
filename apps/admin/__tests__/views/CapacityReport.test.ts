/**
 * CapacityReport.vue 组件测试用例
 * 文件路径：apps/admin/__tests__/views/CapacityReport.test.ts
 * 阶段：🟣 重构阶段（Vue Query + 配置抽离）
 *
 * 📌 测试说明：
 * - Mock @antv/s2 的 PivotSheet 类（绕过 JSDOM Canvas 崩溃）
 * - Mock useCapacityReportQuery Hook
 * - 测试配置常量注入（核心功能）
 * - PivotSheet 渲染逻辑在 setup.ts 中 mock，不直接测试组件导入
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ✅ 导入配置常量进行验证
import {
  ROWS,
  COLUMNS,
  VALUES,
  S2_SIZE,
  S2_HIERARCHY_TYPE,
  S2_CONDITION_TEXT_MAP,
} from '@/constants';

describe('CapacityReport - S2 Canvas 封装组件（重构版）', () => {
  beforeEach(() => {
    // ✅ 每个测试前重置所有 Mock
    vi.resetAllMocks();
  });

  describe('Data Configuration - 配置常量注入', () => {
    // 📋 测试用例 1：配置常量应正确导出
    it('应该导出 ROWS, COLUMNS, VALUES 配置常量', async () => {
      expect(ROWS).toEqual(['factory', 'line']);
      expect(COLUMNS).toEqual(['date']);
      expect(VALUES).toEqual(['yield', 'defectRate']);
    });

    // 📋 测试用例 2：S2 尺寸配置应正确导出
    it('应该导出 S2_SIZE 配置常量', async () => {
      expect(S2_SIZE).toEqual({ width: 1200, height: 600 });
      expect(S2_HIERARCHY_TYPE).toEqual('tree');
    });

    // 📋 测试用例 3：S2 条件映射配置应正确导出
    it('应该导出 S2_CONDITION_TEXT_MAP 配置常量', async () => {
      expect(S2_CONDITION_TEXT_MAP).toHaveProperty('yield');
      expect(S2_CONDITION_TEXT_MAP).toHaveProperty('defectRate');

      // ✅ 验证映射函数
      const yieldMapping = S2_CONDITION_TEXT_MAP.yield.mapping(9000);
      expect(yieldMapping.fill).toBe('#52c41a');

      const defectRateMapping = S2_CONDITION_TEXT_MAP.defectRate.mapping(0.06);
      expect(defectRateMapping.fill).toBe('#ff4d4f');
    });
  });
});
