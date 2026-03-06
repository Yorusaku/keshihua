/**
 * Capacity 宏观数据查询 Hook
 * 文件路径：packages/shared/src/network/queries/useCapacityQuery.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 需求说明：
 * - Capacity（产能）是大屏的核心指标之一
 * - 数据包括：total（总数）、completed（完成数）、defectRate（不良率）、timestamp（时间戳）
 * - 后台每 30 秒静默轮询（refetchInterval: 30000）
 * - 使用模拟 API（setTimeout + 假数据），真实接口后续接入
 */
import { useQuery } from '@tanstack/vue-query';
import { fetchCapacityData } from './capacity';
/**
 * 使用 Capacity 宏观数据查询 Hook
 * @description 通过 Vue Query 管理 Capacity 数据的缓存与轮询
 *
 * 📌 Hook 返回：
 * - data: CapacityData - 缓存数据
 * - isLoading: boolean - 加载状态
 * - isError: boolean - 错误状态
 * - refetch: () => void - 手动刷新
 *
 * 📌 轮询机制：
 * - refetchInterval: 30000 - 每 30 秒静默轮询
 * - refetchIntervalInBackground: true - 后台继续轮询（大屏常驻）
 */
export const useCapacityQuery = () => {
    return useQuery({
        // ✅ Query Key（唯一标识，用于缓存、去重、刷新）
        queryKey: ['capacity'],
        // ✅ Query Fn（数据获取函数）
        queryFn: fetchCapacityData,
        // ✅ refetchInterval: 30 秒 - 每 30 秒静默轮询
        // 📌 意图：大屏数据需要定期刷新，确保实时性
        refetchInterval: 1000 * 30,
        // ✅ refetchIntervalInBackground: true - 后台继续轮询
        // 📌 意图：大屏常驻全屏运行，不因窗口聚焦/失焦停止轮询
        refetchIntervalInBackground: true,
    });
};
//# sourceMappingURL=useCapacityQuery.js.map