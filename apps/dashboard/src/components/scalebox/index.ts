/**
 * ScaleBox 组件导出文件
 * 文件路径：apps/dashboard/src/components/scalebox/index.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 * 
 * 📌 导出规范：
 * - 组件默认导出（用于 import ScaleBox from '...'）
 * - 重新导出类型接口（用于 props 类型推断）
 * - 重新导出常量（用于外部引用设计尺寸）
 * - 重新导出工具函数（用于外部调用计算逻辑）
 */

// ✅ 组件导出（默认导出）
export { default as ScaleBox } from './ScaleBox.vue';

// ✅ 工具函数导出（供外部调用计算逻辑）
export { calculateScale } from './helpers';

// ✅ 常量导出（供外部引用设计尺寸）
export { 
  DEFAULT_DESIGN_WIDTH, 
  DEFAULT_DESIGN_HEIGHT, 
  SCALE_BOX_DEFAULT_PROPS 
} from './constants';
