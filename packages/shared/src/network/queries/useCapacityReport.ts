/**
 * 产能报表查询 Hook
 * 文件职责：封装产能报表查询，支持查询参数变化时保持旧数据。
 */

import type { Ref } from 'vue';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { ICapacityReportData, ICapacityReportParams } from '../api/report';
import { fetchCapacityReport } from '../api/report';

export function useCapacityReportQuery(
  params: Ref<ICapacityReportParams>
): UseQueryReturnType<ICapacityReportData[], Error> {
  return useQuery({
    queryKey: ['capacityReport', params],
    queryFn: () => fetchCapacityReport(params.value),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
