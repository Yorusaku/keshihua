/**
 * 产能透视报表查询 Hook
 * 文件路径：packages/shared/src/network/queries/useCapacityReport.ts
 * 阶段：🟣 重构阶段（占位导出）
 *
 * 📌 功能说明：
 * - useCapacityReportQuery：封装产能透视报表查询逻辑的 Vue Query Hook
 * - 目前是占位实现，等待后续功能开发
 */

import type { Ref } from 'vue';
import type { UseQueryResult } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { ICapacityReportParams, ICapacityReportResponse } from '../api/capacity';

// 模拟 API（占位）
const fetchCapacityReport = async (params: ICapacityReportParams): Promise<ICapacityReportResponse> => {
  // 暂未实现
  throw new Error('fetchCapacityReport is not implemented yet');
};

/**
 * 📌 产能透视报表查询 Hook
 * @description 使用 Vue Query 封装产能透视报表查询逻辑（占位实现）
 * @param params 响应式查询参数 Ref<ICapacityReportParams>
 * @returns UseQueryResult<ICapacityReportResponse, Error>
 */
export function useCapacityReportQuery(
  params: Ref<ICapacityReportParams>
): UseQueryResult<ICapacityReportResponse, Error> {
  return useQuery({
    queryKey: ['capacityReport', params],
    queryFn: () => fetchCapacityReport(params.value),
    staleTime: 5 * 60 * 1000, // 5 分钟
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
}
