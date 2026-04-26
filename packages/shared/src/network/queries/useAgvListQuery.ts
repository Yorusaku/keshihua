/**
 * AGV 列表查询 Hook
 * 文件路径：packages/shared/src/network/queries/useAgvListQuery.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 功能说明：
 * - useAgvListQuery：封装 AGV 列表查询逻辑的 Vue Query Hook
 * - 支持动态参数绑定、分页、搜索、状态过滤
 */

import type { Ref } from 'vue';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { IAgvListParams, IAgvListResponse } from '../api/agv';
import { fetchAgvList } from '../api/agv';

/**
 * 📌 AGV 列表查询 Hook（绿灯实现）
 * @description 封装 AGV 列表查询逻辑，使用 Vue Query 管理状态
 * @param params 响应式参数对象 Ref<IAgvListParams>
 * @returns UseQueryResult<IAgvListResponse, Error>
 */
export function useAgvListQuery(
  params: Ref<IAgvListParams>
): UseQueryReturnType<IAgvListResponse, Error> {
  return useQuery({
    // ✅ 动态依赖参数的 queryKey
    queryKey: ['agvList', params],
    
    // ✅ 使用 fetchAgvList 函数作为查询函数
    queryFn: () => fetchAgvList(params.value),
    
    // ✅ 禁用窗口聚焦自动刷新（避免频繁请求）
    refetchOnWindowFocus: false,
  });
}
