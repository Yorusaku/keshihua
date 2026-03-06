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
    total: number;
    completed: number;
    completionRate: number;
    defectRate: number;
    timestamp: number;
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
//# sourceMappingURL=types.d.ts.map