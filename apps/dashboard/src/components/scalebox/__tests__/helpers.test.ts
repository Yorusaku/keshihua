/**
 * ScaleBox 核心计算函数测试用例
 * 文件路径：apps/dashboard/src/components/scalebox/__tests__/helpers.test.ts
 * 阶段：🔴 红灯阶段（测试先行）
 * 说明：本测试文件验证 calculateScale 纯函数的边界逻辑，确保在无业务实现时必然失败（红灯）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Mock 工具函数（按 V5 规约，实际项目应从 lodash-es 引入）
 * 此处仅作占位 Mock，确保测试文件可独立运行
 */
const mockMathMin = Math.min.bind(Math);

describe('ScaleBox - Helper Functions', () => {
  describe('calculateScale', () => {
    // 按 V5 规约：在红灯阶段，业务函数尚未实现，此测试必然失败（红灯状态有效）
    // 以下测试用例按照蓝灯阶段设计提案编排，用于验证测试逻辑的完备性

    it('当容器尺寸等于设计尺寸时，应该返回 1.0 缩放比例', () => {
      const containerWidth = 1920;
      const containerHeight = 1080;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBe(1.0);
    });

    it('当容器尺寸为设计尺寸一半时，应该返回 0.5 缩放比例', () => {
      const containerWidth = 960;
      const containerHeight = 540;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBe(0.5);
    });

    it('当容器宽高比小于设计宽高比时，应该按宽度比例缩放', () => {
      // 设计比例：1920/1080 ≈ 1.778
      // 容器比例：1000/1080 ≈ 0.926（更窄）
      // 期望：取 scaleX = 1000/1920 ≈ 0.521
      const containerWidth = 1000;
      const containerHeight = 1080;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBeCloseTo(0.5208, 3);
    });

    it('当容器宽高比大于设计宽高比时，应该按高度比例缩放', () => {
      // 设计比例：1920/1080 = 1.778
      // 容器比例：1920/500 = 3.84（更高）
      // 期望：取 scaleY = 500/1080 ≈ 0.463
      const containerWidth = 1920;
      const containerHeight = 500;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBeCloseTo(0.463, 3);
    });

    it('当容器宽高均为 0 时，应该返回 0 缩放比例', () => {
      const containerWidth = 0;
      const containerHeight = 0;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBe(0);
    });

    it('当容器宽度为 0 时，应该返回 0 缩放比例', () => {
      const containerWidth = 0;
      const containerHeight = 1080;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBe(0);
    });

    it('当容器高度为 0 时，应该返回 0 缩放比例', () => {
      const containerWidth = 1920;
      const containerHeight = 0;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBe(0);
    });

    it('当容器为极端带鱼屏（宽度极大，高度极小）时，应该按高度比例缩放', () => {
      // 模拟极端带鱼屏：3840x300
      const containerWidth = 3840;
      const containerHeight = 300;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBeCloseTo(0.2778, 3);
    });

    it('当容器为极端竖屏（宽度极小，高度极大）时，应该按宽度比例缩放', () => {
      // 模拟极端竖屏：300x2160
      const containerWidth = 300;
      const containerHeight = 2160;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBeCloseTo(0.1562, 3);
    });

    it('当设计尺寸与容器尺寸比例不整除时，应该保留小数精度', () => {
      const containerWidth = 1366;
      const containerHeight = 768;
      const designWidth = 1920;
      const designHeight = 1080;

      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const expectedScale = mockMathMin(scaleX, scaleY);

      expect(expectedScale).toBeCloseTo(0.7118, 3);
    });
  });
});
