/**
 * Network 模块统一导出
 * 文件职责：对外提供 queryClient、API 方法、查询 hooks 与核心类型。
 */

// QueryClient
export { queryClient } from './queryClient';

// 核心类型
export type {
  CapacityData,
  UseCapacityQueryResult,
  UseCapacityMutationResult,
  ApiResponse,
  CapacityQueryKey,
  ISensorTimeSeriesParams,
  ISensorTimeSeriesResponse,
  ISensorTimeSeriesDataPoint,
} from './types';

// API 类型与方法
export type { IAgvListParams, IAgvListResponse, IAddAgvPayload } from './api/agv';
export { fetchAgvList, addAgv } from './api/agv';
export type { ICapacityReportData, ICapacityReportParams } from './api/report';
export { fetchCapacityReport, generateCapacityReportData, getMockReportData } from './api/report';
export {
  fetchSensorTimeSeries,
  generateSensorTimeSeriesData,
  getMockSensorData,
  clearSensorDataCache,
} from './api/sensor';
export { fetchCapacityData } from './queries/capacity';

// Query hooks
export { useCapacityQuery } from './queries/useCapacityQuery';
export { useAgvListQuery } from './queries/useAgvListQuery';
export { useAddAgvMutation } from './queries/useAgvMutation';
export { useSensorTrendQuery } from './queries/useSensorQuery';
export { useCapacityReportQuery } from './queries/useCapacityReport';
