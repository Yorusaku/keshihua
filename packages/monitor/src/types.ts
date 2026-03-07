/**
 * 监控 SDK 类型定义
 * 文件路径：packages/monitor/src/types.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 */

/**
 * 📌 监控 SDK 配置项
 */
export interface MonitorOptions {
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
   * 📌 是否启用调试模式（打印日志）
   * @default false
   */
  debug?: boolean;

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
}

/**
 * 📌 错误收集器配置
 */
export interface ErrorPluginOptions {
  /**
   * 📌 是否收集 JS 堆栈信息（可能包含敏感数据）
   * @default false
   */
  withStack?: boolean;
}

/**
 * 📌 上报数据结构
 */
export interface ReportData {
  /**
   * 📌 数据类型
   * - 'error': 异常数据
   * - 'performance': 性能数据
   */
  type: 'error' | 'performance';

  /**
   * 📌 具体数据内容
   */
  data: ErrorData | PerformanceData;

  /**
   * 📌 上报时间戳（ISO 8601 格式）
   */
  timestamp: string;

  /**
   * 📌 应用标识（可选，在 Reporter 内部自动填充）
   */
  appId?: string;
}

/**
 * 📌 错误数据结构
 */
export interface ErrorData {
  /**
   * 📌 错误类型
   * - 'js': JS 运行时错误
   * - 'resource': 静态资源加载错误（图片/脚本/CSS）
   */
  type: 'js' | 'resource';

  /**
   * 📌 错误消息
   */
  message: string;

  /**
   * 📌 错误文件路径
   */
  filename: string;

  /**
   * 📌 错误行号
   */
  lineno: number;

  /**
   * 📌 错误列号
   */
  colno: number;

  /**
   * 📌 错误堆栈（仅 JS 错误）
   */
  stack?: string;

  /**
   * 📌 Promise 异常的错误对象（仅 Promise 异常）
   */
  error?: string;
}

/**
 * 📌 性能数据结构
 */
export interface PerformanceData {
  /**
   * 📌 性能指标名称
   */
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB';

  /**
   * 📌 性能指标值（毫秒）
   */
  value: number;

  /**
   * 📌 性能指标的 entry 对象（用于调试）
   */
  entry?: string;
}

/**
 * 📌 Reporter 实例类型（内部使用）
 */
export interface Reporter {
  /**
   * 📌 上报方法
   */
  report: (data: ReportData) => void;

  /**
   * 📌 关闭 Reporter（停止队列处理）
   */
  close: () => void;
}
