/**
 * 传感器时序趋势查询 Hook
 * 文件路径：packages/shared/src/network/queries/useSensorQuery.ts
 * 阶段：🟣 重构阶段（架构师级代码打磨）
 *
 * 📌 功能说明：
 * - useSensorTrendQuery：封装传感器时序数据查询逻辑的 Vue Query Hook
 * - 支持动态参数、缓存优化（staleTime: 5 分钟）
 */

import type { Ref } from 'vue';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { ISensorTimeSeriesParams, ISensorTimeSeriesResponse } from '../api/sensor';
import { fetchSensorTimeSeries } from '../api/sensor';

/**
 * 📌 传感器时序趋势查询 Hook
 * @description 使用 Vue Query 封装传感器时序数据查询逻辑
 * @param params 响应式查询参数 Ref<ISensorTimeSeriesParams>
 * @returns UseQueryResult<ISensorTimeSeriesResponse, Error>
 */
export function useSensorTrendQuery(
  params: Ref<ISensorTimeSeriesParams>
): UseQueryReturnType<ISensorTimeSeriesResponse, Error> {
  return useQuery({
    // ✅ 动态依赖参数的 queryKey
    queryKey: ['sensorTrend', params],

    // ✅ 使用 fetchSensorTimeSeries 函数作为查询函数
    queryFn: () => fetchSensorTimeSeries(params.value),

    // ✅ 设置 staleTime 为 5 分钟（300000ms）
    // 📌 意图：历史传感器数据在一定时间内是不变的，极致利用缓存
    //          避免频繁请求相同的历史数据
    staleTime: 5 * 60 * 1000, // 5 分钟

    // ✅ 禁用窗口聚焦自动刷新（避免频繁请求）
    refetchOnWindowFocus: false,
  });
}
