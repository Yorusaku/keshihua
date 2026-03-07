/**
 * Network 模块类型定义
 * 文件路径：packages/shared/src/network/types.ts
 * 阶段：🔴 红灯阶段（传感器时序数据类型新增）
 *
 * 📌 类型说明：
 * - CapacityData：大屏产能核心指标
 * - UseQueryReturnType 类型别名：简化 Hook 返回类型
 * - ISensorTimeSeriesDataPoint/Response：传感器时序数据类型（🔴 新增）
 */

import type { UseQueryReturnType } from '@tanstack/vue-query';

/**
 * Capacity 宏观数据
 * @description 大屏产能核心指标
 */
export interface CapacityData {
  // ✅ 产能总数（AGV、机器人、设备等）
  total: number;

  // ✅ 完成数量
  completed: number;

  // ✅ 完成率（0 ~ 1）
  completionRate: number;

  // ✅ 不良率（0 ~ 1）
  defectRate: number;

  // ✅ 当前时间戳
  timestamp: number;

  // ✅ 预留字段（Milestone 3 扩展）
  [key: string]: unknown;
}

/**
 * UseQueryReturnType 类型别名（简化）
 */
export type UseCapacityQueryResult = UseQueryReturnType<CapacityData, Error>;

/**
 * UseMutationReturnType 类型别名（预留扩展）
 */
export type UseCapacityMutationResult = unknown;

/**
 * API 返回类型（预留扩展）
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

/**
 * Query Key 类型
 */
export type CapacityQueryKey = ['capacity'];

// 🔴 传感器时序数据类型（🔴 新增）

/**
 * 📌 传感器时序数据单条记录
 */
export interface ISensorTimeSeriesDataPoint {
  timestamp: number;   // 时间戳（毫秒）
  value: number;       // 传感器值
  quality?: number;    // 数据质量（0 ~ 1）
}

/**
 * 📌 传感器时序数据响应接口
 */
export interface ISensorTimeSeriesResponse {
  sensorId: string;                        // 传感器 ID
  startTime: number;                       // 查询开始时间戳
  endTime: number;                         // 查询结束时间戳
  data: ISensorTimeSeriesDataPoint[];      // 时序数据点列表
  totalCount: number;                      // 总数据点数量
}

/**
 * 📌 传感器时序数据查询参数接口
 */
export interface ISensorTimeSeriesParams {
  sensorId: string;    // 传感器 ID
  startTime: number;   // 开始时间戳（毫秒）
  endTime: number;     // 结束时间戳（毫秒）
  limit?: number;      // 数据点数量限制（默认 1000）
}
