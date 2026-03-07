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
} from './network/types';
export { useCapacityQuery } from './network/queries/useCapacityQuery';
export { fetchCapacityData } from './network/queries/capacity';
export { useAgvListQuery } from './network/queries/useAgvListQuery';
export { fetchAgvList } from './network/api/agv';
