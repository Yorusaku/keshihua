/**
 * QueryClient 全局配置
 * 文件路径：packages/shared/src/network/queryClient.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 配置说明（大屏场景）：
 * - staleTime: 60000 (1 分钟) - 大屏数据无需频繁刷新，省流
 * - gcTime: 1000 * 60 * 5 (5 分钟) - 大屏持久化，短时间切换不回收
 * - refetchOnWindowFocus: false - 大屏全屏运行，禁用窗口聚焦刷新
 * - retry: 2 - 失败最多重试 2 次，避免刷屏
 */
import { QueryClient, QueryCache } from '@tanstack/vue-query';
// ✅ 自定义 QueryCache（全局错误处理）
const queryCache = new QueryCache({
    // 🛡️ 全局错误处理：大屏需持续运行，错误需记录但不中断流程
    onError: (error, query) => {
        console.error(`[VueQuery] Query ${query.queryKey.join('/')} 失败:`, error);
    },
    // 📌 全局 onSuccess：预留日志上报（Milestone 3）
    onSuccess: (data, query) => {
        // TODO: [Milestone 3] 上报数据变更事件
    },
});
/**
 * 创建全局 QueryClient 实例
 * @description 配置大屏场景的 QueryClient，支持静默轮询与智能缓存
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        // 📌 queries: 服务端状态查询配置
        queries: {
            // ✅ staleTime: 1 分钟 - 大屏数据无需频繁刷新，省流
            staleTime: 1000 * 60,
            // ✅ gcTime: 5 分钟 - 大屏持久化，短时间切换不回收
            gcTime: 1000 * 60 * 5,
            // ✅ refetchOnWindowFocus: false - 大屏全屏运行，禁用窗口聚焦刷新
            refetchOnWindowFocus: false,
            // ✅ refetchOnReconnect: false - 避免网络重连时刷屏
            refetchOnReconnect: false,
            // ✅ retry: 2 - 失败最多重试 2 次，避免刷屏
            retry: 2,
            // ✅ retryDelay: 1 秒 - 重试间隔
            retryDelay: 1000,
        },
        // 📌 mutations: 服务端数据变更配置（预留扩展）
        mutations: {
            retry: 1,
            retryDelay: 1000,
        },
    },
    // ✅ 自定义 QueryCache（全局错误处理）
    queryCache,
});
//# sourceMappingURL=queryClient.js.map