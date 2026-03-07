/**
 * SDK 入口
 * 文件路径：packages/monitor/src/index.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 */

import { Reporter, type ReporterOptions } from './transport';
import { setupErrorCatch, type ErrorPluginOptions } from './plugins/error';
import { setupPerformanceCatch } from './plugins/performance';
import type { MonitorOptions } from './types';

/**
 * 📌 Monitor 配置（合并了 Reporter 和 Plugin 配置）
 */
export interface MonitorConfig {
  /**
   * 📌 上报地址
   */
  dsn: string;

  /**
   * 📌 应用标识
   */
  appId: string;

  /**
   * 📌 Reporter 配置
   */
  reporter?: {
    /**
     * 📌 批量上报间隔（毫秒）
     */
    flushInterval?: number;

    /**
     * 📌 队列最大缓存数量
     */
    maxQueueSize?: number;
  };

  /**
   * 📌 错误收集器配置
   */
  error?: ErrorPluginOptions;

  /**
   * 📌 是否启用性能收集
   * @default true
   */
  performance?: boolean;

  /**
   * 📌 是否启用调试模式
   * @default false
   */
  debug?: boolean;
}

/**
 * 📌 SDK 实例
 */
interface MonitorInstance {
  /**
   * 📌 关闭 SDK（停止所有采集）
   */
  close: () => void;
}

/**
 * 📌 初始化 Monitor SDK
 * @param config Monitor 配置
 * @returns Monitor 实例
 * @description
 *  1. 创建 Reporter 实例（队列 + 上报器）
 *  2. 注册错误收集器（JS + Promise）
 *  3. 注册性能收集器（FCP）
 *  4. 返回 Monitor 实例（用于关闭 SDK）
 */
export function initMonitor(config: MonitorConfig): MonitorInstance {
  // ✅ 构建 Reporter 配置
  const reporterOptions: ReporterOptions = {
    dsn: config.dsn,
    appId: config.appId,
    flushInterval: config.reporter?.flushInterval,
    maxQueueSize: config.reporter?.maxQueueSize,
    debug: config.debug,
  };

  // ✅ 创建 Reporter 实例
  const reporter = new Reporter(reporterOptions);

  // ✅ 注册错误收集器
  setupErrorCatch(reporter, config.error);

  // ✅ 注册性能收集器（可选）
  if (config.performance !== false) {
    setupPerformanceCatch(reporter);
  }

  // ✅ 返回 Monitor 实例（用于关闭 SDK）
  return {
    close: () => {
      reporter.close();
    },
  };
}
