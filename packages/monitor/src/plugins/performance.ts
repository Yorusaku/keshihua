/**
 * 性能收集器
 * 文件路径：packages/monitor/src/plugins/performance.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 */

import type { Reporter } from '../transport';
import type { PerformanceData } from '../types';

/**
 * 📌 性能指标名称枚举
 */
export enum PerformanceMetric {
  FCP = 'FCP', // First Contentful Paint
  LCP = 'LCP', // Largest Contentful Paint
  CLS = 'CLS', // Cumulative Layout Shift
  FID = 'FID', // First Input Delay
  TTFB = 'TTFB', // Time To First Byte
}

/**
 * 📌 性能收集器配置
 */
export interface PerformancePluginOptions {
  /**
   * 📌 性能指标名称
   */
  metric: PerformanceMetric.FCP;
}

/**
 * 📌 设置性能收集器
 * @param reporter Reporter 实例，用于上报性能数据
 * @description
 *  1. 使用 PerformanceObserver 监听 'paint' 条目
 *  2. 提取 first-contentful-paint (FCP)
 *  3. 上报 FCP 数据
 *  4. 调用 disconnect() 停止监听（FCP 只需采集一次）
 */
export function setupPerformanceCatch(reporter: Reporter): void {
  /**
   * 📌 PerformanceObserver 配置
   * @description 监听 'paint' 条目，获取首次绘制时间
   */
  const observer = new PerformanceObserver((list) => {
    // ✅ 遍历所有性能条目
    for (const entry of list.getEntries()) {
      // ✅ 仅处理 first-contentful-paint
      if (entry.name === 'first-contentful-paint') {
        // ✅ 构建性能数据
        const performanceData: PerformanceData = {
          name: PerformanceMetric.FCP,
          value: entry.startTime, // ✅ FCP 值（毫秒）
          entry: JSON.stringify(entry, null, 2),
        };

        // ✅ 上报性能数据
        reporter.report({
          type: 'performance',
          data: performanceData,
          timestamp: new Date().toISOString(),
          appId: 'admin',
        });

        // ✅ 上报后立即停止监听（FCP 只需采集一次）
        observer.disconnect();
        break;
      }
    }
  });

  // ✅ 启动监听（仅监听 'paint' 条目）
  observer.observe({
    entryTypes: ['paint'],
  });
}
