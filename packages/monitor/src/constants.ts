/**
 * 监控 SDK 常量定义
 * 文件路径：packages/monitor/src/constants.ts
 * 阶段：🟣 重构阶段（架构师级代码打磨）
 *
 * 📌 常量说明：
 * - DEFAULT_FLUSH_INTERVAL：默认批量上报间隔（5000ms）
 * - DEFAULT_MAX_QUEUE_SIZE：默认队列最大缓存（100）
 * - ERROR_TYPE_JS：JS 运行时错误类型标识
 * - ERROR_TYPE_RESOURCE：资源加载错误类型标识
 * - PERFORMANCE_METRIC_FCP：FCP 性能指标名称
 * - FCP_ENTRY_NAME：FCP PerformanceEntry 名称
 */

/**
 * 📌 默认批量上报间隔（毫秒）
 * @description 当队列容量未满时，定时器会在该时间后批量触发上报
 */
export const DEFAULT_FLUSH_INTERVAL = 5000;

/**
 * 📌 默认队列最大缓存数量
 * @description 队列达到该数量时会立即触发上报，不等待定时器
 */
export const DEFAULT_MAX_QUEUE_SIZE = 100;

/**
 * 📌 错误类型：JS 运行时错误
 * @description 用于 ReportData.data.type 标识
 */
export const ERROR_TYPE_JS = 'js';

/**
 * 📌 错误类型：静态资源加载错误
 * @description 用于 ReportData.data.type 标识
 */
export const ERROR_TYPE_RESOURCE = 'resource';

/**
 * 📌 性能指标：FCP（First Contentful Paint）
 * @description 首次内容绘制时间
 */
export const PERFORMANCE_METRIC_FCP = 'FCP';

/**
 * 📌 FCP PerformanceEntry 名称
 * @description 用于 PerformanceObserver 判断 entry 类型
 */
export const FCP_ENTRY_NAME = 'first-contentful-paint';
