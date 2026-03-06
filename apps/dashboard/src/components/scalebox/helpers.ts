/**
 * ScaleBox 核心计算工具函数
 * 文件路径：apps/dashboard/src/components/scalebox/helpers.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 * 
 * 📌 计算逻辑说明：
 * - 采用" contain "策略：取宽度缩放比例 scaleX 和高度缩放比例 scaleY 的最小值
 * - 确保容器内容在任何屏幕尺寸下都能完整显示，不被裁剪
 * - 防御性编程：所有除数为 0 的场景返回 0，避免 Infinity/NaN 污染 DOM
 * 
 * 📦 依赖外部常量（已抽离至 constants.ts）：
 * - DEFAULT_DESIGN_WIDTH: 1920
 * - DEFAULT_DESIGN_HEIGHT: 1080
 */

import { DEFAULT_DESIGN_WIDTH, DEFAULT_DESIGN_HEIGHT } from './constants';

/**
 * 计算 ScaleBox 缩放比例
 * @param containerWidth - 实际容器宽度（像素）
 * @param containerHeight - 实际容器高度（像素）
 * @param designWidth - 设计稿宽度（默认 DEFAULT_DESIGN_WIDTH）
 * @param designHeight - 设计稿高度（默认 DEFAULT_DESIGN_HEIGHT）
 * @returns 缩放比例（0.0 ~ 1.0+），当无法计算时返回 0
 * 
 * 🤔 为什么要用 Math.min(scaleX, scaleY)？
 * - 这是 CSS "object-fit: contain" 的等效算法
 * - 保证内容在容器内完整可见，不会被裁剪
 * - 可能出现黑边（上下或左右），但比裁剪更安全
 */
export function calculateScale(
  containerWidth: number,
  containerHeight: number,
  designWidth: number = DEFAULT_DESIGN_WIDTH,
  designHeight: number = DEFAULT_DESIGN_HEIGHT
): number {
  // 🛡️ 防御性编程：处理非数字输入
  const width = Number(containerWidth) || 0;
  const height = Number(containerHeight) || 0;
  const dWidth = Number(designWidth) || DEFAULT_DESIGN_WIDTH;
  const dHeight = Number(designHeight) || DEFAULT_DESIGN_HEIGHT;

  // 🛡️ 防御性编程：当容器或设计尺寸为 0 时，返回 0（避免除零）
  if (width === 0 || height === 0 || dWidth === 0 || dHeight === 0) {
    return 0;
  }

  // 📐 计算宽高缩放比例
  const scaleX = width / dWidth;
  const scaleY = height / dHeight;

  // ✅ 返回最小比例（保证内容完整显示，不被裁剪）
  return Math.min(scaleX, scaleY);
}
