/**
 * Network 模块类型定义
 * 文件路径：packages/shared/src/network/types.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 类型说明：
 * - CapacityData：大屏产能核心指标
 * - UseQueryReturnType 类型别名：简化 Hook 返回类型
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
