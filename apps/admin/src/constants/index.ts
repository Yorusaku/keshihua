/**
 * 应用常量定义
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 常量说明：
 * - AGV 常量：AGV_STATUS_TEXT_MAP, AGV_STATUS_COLOR_MAP
 * - Report 常量：S2 维度配置、尺寸、条件映射
 */

// ✅ AGV 常量导出
export { AGV_STATUS_TEXT_MAP, AGV_STATUS_COLOR_MAP } from './agv';

// ✅ Report 常量导出
export {
  ROWS,
  COLUMNS,
  VALUES,
  S2_SIZE,
  S2_HIERARCHY_TYPE,
  S2_CONDITION_TEXT_MAP,
} from './report';
