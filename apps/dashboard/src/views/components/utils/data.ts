/**
 * 数据初始化工具
 * 文件路径：apps/dashboard/src/views/components/utils/data.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 工具说明：
 * - initializeHistoricalData：生成 50,000 条模拟历史时序数据
 * - 用于 CapacityPanel 的 TrendChart 极限压测（LTTB 降采样）
 */

/**
 * 初始化 50,000 条历史时序数据
 * @description 生成过去 12 小时的模拟产能数据（50,000 条）
 * @returns Array<{ time: number; value: number }> - 模拟的时序数据数组
 *
 * 📌 数据生成策略：
 * - 时间范围：过去 12 小时（当前时间 - 12h）
 * - 数据点数：50,000 条（超出 largeThreshold: 2000，触发 LTTB 降采样）
 * - 时间间隔：每条数据间隔约 864ms（12h / 50000 ≈ 0.864s）
 * - 数值范围：1000 ~ 1050（模拟产能波动）
 */
export const initializeHistoricalData = (): Array<{ time: number; value: number }> => {
  const data: Array<{ time: number; value: number }> = [];
  const now = Date.now();
  const startTime = now - 12 * 60 * 60 * 1000; // 12 小时前（毫秒）

  // ✅ for 循环生成 50,000 条数据
  for (let i = 0; i < 50000; i++) {
    const time = startTime + i * 864; // 每条间隔 864ms
    const value = 1000 + Math.random() * 50; // 模拟产能波动（1000 ~ 1050）

    data.push({ time, value });
  }

  return data;
};
