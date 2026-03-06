/**
 * Network 模块导出
 * 文件路径：packages/shared/src/network/index.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 导出说明：
 * - queryClient：全局 QueryClient 实例
 * - UseQueryResult 类型别名：简化 Hook 返回类型
 * - CapacityData：大屏产能核心指标
 * - useCapacityQuery：Capacity 查询 Hook
 */
// ✅ 核心类与方法导出
export { queryClient } from './queryClient';
// ✅ Query Hooks 导出
export { useCapacityQuery } from './queries/useCapacityQuery';
// ✅ API 导出
export { fetchCapacityData } from './queries/capacity';
//# sourceMappingURL=index.js.map