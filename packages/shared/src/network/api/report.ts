/**
 * report API - 产能透视报表
 * 文件路径：packages/shared/src/network/api/report.ts
 * 阶段：🔴 红灯阶段（占位文件 - 业务逻辑待实现）
 *
 * 📌 红灯说明：
 * - 此文件为占位文件，所有方法抛出 "Not implemented (Red Light)" 错误
 * - 绿灯阶段将实现完整的 Mock 数据生成和 API
 */

/**
 * 📌 产能报表数据接口
 */
export interface ICapacityReportData {
  factory: string;      // 工厂（维度）
  line: string;         // 产线（维度）
  date: string;         // 日期（维度）
  yield: number;        // 产量（指标）
  defectRate: number;   // 不良率（指标）
}

/**
 * 📌 产能报表查询参数接口
 */
export interface ICapacityReportParams {
  factory?: string;  // 工厂过滤
  line?: string;     // 产线过滤
  date?: string;     // 日期过滤
}

/**
 * 📌 占位实现（红灯阶段）
 * @description 抛出错误，表示功能尚未实现
 */
const placeholderReport = {
  generateCapacityReportData: () => {
    throw new Error('Not implemented (Red Light): generateCapacityReportData');
  },

  fetchCapacityReport: () => {
    throw new Error('Not implemented (Red Light): fetchCapacityReport');
  },
};

/**
 * 📌 导出占位函数
 */
export const generateCapacityReportData = placeholderReport.generateCapacityReportData;
export const fetchCapacityReport = placeholderReport.fetchCapacityReport;
