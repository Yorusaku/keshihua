/**
 * SDK 入口
 * 文件路径：packages/monitor/src/index.ts
 * 阶段：🟣 重构阶段（常量抽离 + SSR 防御 + TSDoc 补全 + 生命周期管理）
 */

import { Reporter, type ReporterOptions } from './transport';
import {
  setupErrorCatch,
  type ErrorPluginOptions,
} from './plugins/error';
import { setupPerformanceCatch } from './plugins/performance';

/**
 * 📌 Monitor 配置（合并了 Reporter 和 Plugin 配置）
 * @description 初始化 SDK 所需的完整配置项
 */
export interface MonitorConfig {
  /**
   * 📌 上报地址（DSN：Data Source Name）
   * @example '/api/report' 或 'https://monitor.example.com/api/report'
   */
  dsn: string;

  /**
   * 📌 应用标识
   * @example 'admin' 或 'dashboard'
   */
  appId: string;

  /**
   * 📌 Reporter 配置
   */
  reporter?: {
    /**
     * 📌 批量上报间隔（毫秒）
     * @default 5000
     */
    flushInterval?: number;

    /**
     * 📌 队列最大缓存数量
     * @default 100
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
   * @description 启用后会采集 FCP（First Contentful Paint）指标
   */
  performance?: boolean;

  /**
   * 📌 是否启用调试模式（打印日志）
   * @default false
   */
  debug?: boolean;
}

/**
 * 📌 SDK 实例
 * @description 初始化 SDK 后返回的实例，用于控制 SDK 生命周期
 */
interface MonitorInstance {
  /**
   * 📌 关闭 SDK（停止所有采集）
   * @description
   *  1. 先调用 teardownError() 恢复原生错误处理
   *  2. 再调用 teardownPerf() 停止性能监听
   *  3. 最后调用 reporter.close() 关闭上报队列
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
 * @note 本函数具有 SSR 防御能力，在 Node.js/SSR 环境下会静默返回，不会抛出错误
 * @note 建议在应用入口的 createApp 之前调用此函数
 * @note 提供了 close() 方法用于精确控制 SDK 的生命周期（例如 SSR 渲染后关闭）
 * @example
 * ```ts
 * import { initMonitor } from '@packages/monitor';
 *
 * // 在应用启动时初始化
 * const monitorInstance = initMonitor({
 *   dsn: '/api/report',
 *   appId: 'admin',
 *   performance: true,
 *   debug: import.meta.env.DEV,
 * });
 *
 * // 在应用关闭或 SSR 渲染后清理
 * monitorInstance.close();
 * ```
 */
export function initMonitor(config: MonitorConfig): MonitorInstance {
  // ✅ SSR 防御：确保 window 可用（虽然 SDK 主要在浏览器运行）
  if (typeof window === 'undefined') {
    return {
      close: () => {
        // 静默返回
      },
    };
  }

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

  // ✅ 获取清理函数
  const teardownError = setupErrorCatch(reporter, config.error);
  let teardownPerf = () => {};

  // ✅ 注册性能收集器（可选）
  if (config.performance !== false) {
    teardownPerf = setupPerformanceCatch(reporter);
  }

  // ✅ 返回 Monitor 实例（用于关闭 SDK）
  return {
    close: () => {
      // ✅ 严格的生命周期管理：先撤销全局监听，再关闭上报队列
      teardownError();
      teardownPerf();
      reporter.close();
    },
  };
}
