/**
 * Network 模块导出
 * 文件路径：packages/shared/src/network/index.ts
 * 阶段：🔴 红灯阶段（传感器时序 API 新增）
 *
 * 📌 导出说明：
 * - queryClient：全局 QueryClient 实例
 * - UseQueryResult 类型别名：简化 Hook 返回类型
 * - CapacityData：大屏产能核心指标
 * - useCapacityQuery：Capacity 查询 Hook
 * - IAgvListParams/Response：AGV 列表数据类型
 * - useAgvListQuery：AGV 列表查询 Hook
 * - IAddAgvPayload：AGV 新增入参类型
 * - useAddAgvMutation：AGV 新增 Mutation Hook（占位）
 * - ICapacityReportData：产能报表数据类型
 * - fetchCapacityReport：产能报表查询 API（占位）
 * - ISensorTimeSeriesParams/Response：传感器时序数据类型（🔴 新增）
 * - fetchSensorTimeSeries：传感器时序数据 API（🔴 新增）
 * - generateSensorTimeSeriesData：传感器时序数据生成（🔴 新增）
 */

// ✅ 核心类与方法导出
export { queryClient } from './queryClient';

// ✅ 类型导出
export type {
  CapacityData,
  UseCapacityQueryResult,
  UseCapacityMutationResult,
  ApiResponse,
  CapacityQueryKey,
  IAddAgvPayload,
  ICapacityReportData,
  // 🔴 传感器时序数据类型（🔴 新增）
  ISensorTimeSeriesParams,
  ISensorTimeSeriesResponse,
  ISensorTimeSeriesDataPoint,
} from './types';

// ✅ Query Hooks 导出
export { useCapacityQuery } from './queries/useCapacityQuery';
export { useAgvListQuery } from './queries/useAgvListQuery';

// ✅ API 导出
export { fetchCapacityData } from './queries/capacity';
export { fetchAgvList, IAgvListParams, IAgvListResponse } from './api/agv';
export { addAgv, IAddAgvPayload } from './api/agv';
export { fetchCapacityReport, ICapacityReportData } from './api/report';

// 🔴 传感器时序 API 导出（🔴 新增）
export {
  fetchSensorTimeSeries,
  generateSensorTimeSeriesData,
  ISensorTimeSeriesParams,
  ISensorTimeSeriesResponse,
  ISensorTimeSeriesDataPoint,
} from './api/sensor';
