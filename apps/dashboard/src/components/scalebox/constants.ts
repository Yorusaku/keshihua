/**
 * ScaleBox 设计尺寸常量定义
 * 文件路径：apps/dashboard/src/components/scalebox/constants.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 * 
 * 📌 设计原则：
 * - 所有魔法数字抽离为常量，提升可维护性
 * - 使用大写蛇形命名法（SCREAMING_SNAKE_CASE）区分常量
 * - 导出供 helpers.ts 和 ScaleBox.vue 共同引用
 */

/**
 * 默认设计稿宽度
 * - 1920px 是智慧工厂大屏的主流设计尺寸
 * - 与 1080p (1920x1080) 标准保持一致
 */
export const DEFAULT_DESIGN_WIDTH = 1920;

/**
 * 默认设计稿高度
 * - 1080px 对应 1080p 全高清标准
 * - 与 1920px 宽度构成 16:9 宽屏比例
 */
export const DEFAULT_DESIGN_HEIGHT = 1080;

/**
 * ScaleBox 组件 Props 默认值对象
 * - 提供给 withDefaults 使用
 * - 确保类型安全且避免重复硬编码
 */
export const SCALE_BOX_DEFAULT_PROPS = {
  width: DEFAULT_DESIGN_WIDTH,
  height: DEFAULT_DESIGN_HEIGHT,
} as const;
