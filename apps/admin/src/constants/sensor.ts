/**
 * 传感器时序数据配置常量
 * 阶段：🟣 重构阶段（架构师级代码打磨）
 *
 * 📌 常量说明：
 * - DEFAULT_COUNT：默认数据请求量（100000）
 * - DEFAULT_SENSOR_ID：默认传感器 ID
 * - DEFAULT_COLOR：默认图表主题色 (#3B82B6)
 * - STALE_TIME：缓存有效期（5 分钟）
 */

/**
 * 📌 默认数据请求量（100000 条）
 */
export const DEFAULT_COUNT = 100000;

/**
 * 📌 默认传感器 ID
 */
export const DEFAULT_SENSOR_ID = 'SENSOR-001';

/**
 * 📌 默认图表主题色（蓝色系）
 */
export const DEFAULT_COLOR = '#3B82B6';

/**
 * 📌 缓存有效期（5 分钟 = 300000 毫秒）
 */
export const STALE_TIME = 5 * 60 * 1000;
