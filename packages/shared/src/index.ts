/**
 * @packages/shared 统一入口
 * 文件路径：packages/shared/src/index.ts
 */

// WebSocket/DataBuffer 模块
export { DataBuffer } from './websocket/DataBuffer';
export type { IAgvData, ReadonlyAgvSnapshot } from './websocket/types';

// Network 模块
export { queryClient } from './network/queryClient';
export type {
  CapacityData,
  UseCapacityQueryResult,
  UseCapacityMutationResult,
  ApiResponse,
  CapacityQueryKey,
  IAgvListParams,
  IAgvListResponse,
  IAddAgvPayload,
  ICapacityReportParams,
  ICapacityReportData,
} from './network/types';
export { useCapacityQuery } from './network/queries/useCapacityQuery';
export { fetchCapacityData } from './network/queries/capacity';
export { useAgvListQuery } from './network/queries/useAgvListQuery';
export { fetchAgvList } from './network/api/agv';
export { useAddAgvMutation } from './network/queries/useAgvMutation';
export { addAgv } from './network/api/agv';

// Sensor 模块
export { useSensorTrendQuery } from './network/queries/useSensorQuery';
export { fetchSensorTimeSeries } from './network/api/sensor';

// Report 模块（占位导出）
export { useCapacityReportQuery } from './network/queries/useCapacityReport';
