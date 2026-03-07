/**
 * AGV 相关常量定义
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 常量说明：
 * - AGV_STATUS_TEXT_MAP：状态 -> 文本映射字典
 * - AGV_STATUS_COLOR_MAP：状态 -> 颜色映射字典
 */

/**
 * 📌 AGV 状态文本映射字典
 * @description 将 AGV 状态码映射为中文显示文本
 */
export const AGV_STATUS_TEXT_MAP: Record<string, string> = {
  idle: '空闲',
  moving: '移动中',
  error: '错误',
};

/**
 * 📌 AGV 状态颜色映射字典
 * @description 将 AGV 状态码映射为 Ant Design Tag 组件的颜色
 * - 'success'：绿色（空闲）
 * - 'processing'：蓝色（移动中）
 * - 'error'：红色（错误）
 * - 'default'：灰色（未知状态）
 */
export const AGV_STATUS_COLOR_MAP: Record<string, string> = {
  idle: 'success',
  moving: 'processing',
  error: 'error',
};
