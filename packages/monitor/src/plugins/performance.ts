/**
 * 性能收集器
 * 文件路径：packages/monitor/src/plugins/performance.ts
 * 阶段：🟣 重构阶段（常量抽离 + SSR 防御 + TSDoc 补全 + 生命周期管理）
 */

import type { Reporter } from '../transport';
import type { PerformanceData } from '../types';
import {
  PERFORMANCE_METRIC_FCP,
  FCP_ENTRY_NAME,
} from '../constants';

/**
 * 📌 性能指标名称枚举
 * @description 支持的性能指标类型
 */
export enum PerformanceMetric {
  FCP = 'FCP', // First Contentful Paint - 首次内容绘制
  LCP = 'LCP', // Largest Contentful Paint - 最大内容绘制
  CLS = 'CLS', // Cumulative Layout Shift - 累积布局偏移
  FID = 'FID', // First Input Delay - 首次输入延迟
  TTFB = 'TTFB', // Time To First Byte - 首字节时间
}

/**
 * 📌 性能收集器配置
 * @description 性能收集器的配置选项
 */
export interface PerformancePluginOptions {
  /**
   * 📌 性能指标名称
   * @default PerformanceMetric.FCP
   */
  metric?: PerformanceMetric;
}

/**
 * 📌 设置性能收集器
 * @param reporter Reporter 实例，用于上报性能数据
 * @returns 清理函数，调用后停止性能监听
 * @description
 *  1. 使用 PerformanceObserver 监听 'paint' 条目
 *  2. 提取 first-contentful-paint (FCP)
 *  3. 上报 FCP 数据
 *  4. 返回 cleanup 函数用于销毁监听
 * @note 本函数具有 SSR 防御能力，在 Node.js/SSR 环境下会返回空清理函数
 * @note 性能采集在页面生命周期中仅执行一次，确保数据准确性
 * @note 添加了 try-catch 防御老旧浏览器不支持 'paint' 类型导致的崩溃
 * @example
 * ```ts
 * const teardown = setupPerformanceCatch(reporter);
 * // ... 页面加载完成
 * teardown(); // ✅ 停止监听，释放资源
 * ```
 */
export function setupPerformanceCatch(reporter: Reporter): () => void {
  // ✅ SSR 防御：确保 window 和 PerformanceObserver 可用
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return () => {}; // SSR 返回空函数
  }

  /**
   * 📌 PerformanceObserver 回调
   * @description 监听 'paint' 条目，获取首次绘制时间
   */
  const observer = new PerformanceObserver((list) => {
    // ✅ 遍历所有性能条目
    for (const entry of list.getEntries()) {
      // ✅ 仅处理 first-contentful-paint
      if (entry.name === FCP_ENTRY_NAME) {
        // ✅ 构建性能数据
        const performanceData: PerformanceData = {
          name: PERFORMANCE_METRIC_FCP,
          value: entry.startTime, // ✅ FCP 值（毫秒）
          entry: JSON.stringify(entry, null, 2),
        };

        // ✅ 上报性能数据
        reporter.report({
          type: 'performance',
          data: performanceData,
          timestamp: new Date().toISOString(),
        });

        // ✅ 上报后立即停止监听（FCP 只需采集一次）
        observer.disconnect();
        break;
      }
    }
  });

  // ✅ 启动监听（仅监听 'paint' 条目）
  try {
    // ✅ 防御老旧浏览器不支持 'paint' 类型引发的崩溃
    observer.observe({
      entryTypes: ['paint'],
    });
  } catch (error) {
    // 静默失败，不阻断业务
    // ✅ 调试日志（可选）
    if (typeof console !== 'undefined' && typeof console.error !== 'undefined') {
      console.warn('[Monitor] PerformanceObserver observe failed:', error);
    }
  }

  // ✅ 返回销毁函数
  return () => {
    observer.disconnect();
  };
}
