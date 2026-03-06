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
import { QueryClient } from '@tanstack/vue-query';
/**
 * 创建全局 QueryClient 实例
 * @description 配置大屏场景的 QueryClient，支持静默轮询与智能缓存
 */
export declare const queryClient: QueryClient;
//# sourceMappingURL=queryClient.d.ts.map