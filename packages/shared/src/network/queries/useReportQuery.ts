/**
 * 产能报表查询 Hook
 * 文件路径：packages/shared/src/network/queries/useReportQuery.ts
 * 阶段：🟣 重构阶段（架构师级代码打磨）
 *
 * 📌 功能说明：
 * - useCapacityReportQuery：封装 S2 产能报表查询逻辑的 Vue Query Hook
 * - 支持动态参数过滤（factory/line/date）
 */

import type { Ref } from 'vue';
import type { UseQueryResult } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { ICapacityReportParams, ICapacityReportData } from '../api/report';
import { fetchCapacityReport } from '../api/report';

/**
 * 📌 产能报表查询 Hook
 * @description 使用 Vue Query 封装 S2 数据查询逻辑
 * @param params 响应式查询参数 Ref<ICapacityReportParams>
 * @returns UseQueryResult<ICapacityReportData[], Error>
 */
export function useCapacityReportQuery(
  params: Ref<ICapacityReportParams>
): UseQueryResult<ICapacityReportData[], Error> {
  return useQuery({
    // ✅ 动态依赖参数的 queryKey
    queryKey: ['capacityReport', params],

    // ✅ 使用 fetchCapacityReport 函数作为查询函数
    queryFn: () => fetchCapacityReport(params.value),

    // ✅ 保留上一页数据，防止过滤时表格闪烁
    keepPreviousData: true,

    // ✅ 禁用窗口聚焦自动刷新（避免频繁请求）
    refetchOnWindowFocus: false,
  });
}
