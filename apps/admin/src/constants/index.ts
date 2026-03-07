/**
 * 应用常量定义
 * 阶段：🟣 重构阶段（架构师级代码打磨）
 *
 * 📌 常量说明：
 * - AGV 常量：状态映射
 * - Report 常量：S2 维度配置、尺寸、条件映射
 * - Sensor 常量：默认请求量、主题色、缓存时间
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

// ✅ Sensor 常量导出
export {
  DEFAULT_COUNT,
  DEFAULT_SENSOR_ID,
  DEFAULT_COLOR,
  STALE_TIME,
} from './sensor';
