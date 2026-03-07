/**
 * 产能报表 S2 配置常量
 * 阶段：🟣 重构阶段（架构师级代码打磨）
 *
 * 📌 常量说明：
 * - ROWS：S2 行维度
 * - COLUMNS：S2 列维度
 * - VALUES：S2 指标字段
 * - S2_SIZE：表格尺寸配置
 * - S2_HIERARCHY_TYPE：树状结构类型
 * - S2_CONDITION_TEXT_MAP：文本条件配置
 */

/**
 * 📌 S2 行维度（维度字段）
 */
export const ROWS = ['factory', 'line'];

/**
 * 📌 S2 列维度（维度字段）
 */
export const COLUMNS = ['date'];

/**
 * 📌 S2 指标字段（指标字段）
 */
export const VALUES = ['yield', 'defectRate'];

/**
 * 📌 S2 表格尺寸配置
 */
export const S2_SIZE = {
  width: 1200,
  height: 600,
};

/**
 * 📌 S2 层级结构类型
 */
export const S2_HIERARCHY_TYPE = 'tree';

/**
 * 📌 S2 条件映射配置
 */
export const S2_CONDITION_TEXT_MAP = {
  yield: {
    field: 'yield',
    mapping: (value: number) => ({
      fill: value > 8000 ? '#52c41a' : undefined,
    }),
  },
  defectRate: {
    field: 'defectRate',
    mapping: (value: number) => ({
      fill: value > 0.05 ? '#ff4d4f' : undefined,
    }),
  },
};
