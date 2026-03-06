/**
 * Capacity API 查询函数
 * 文件路径：packages/shared/src/network/queries/capacity.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 需求说明：
 * - 使用 setTimeout 模拟网络延迟（200 ~ 500ms）
 * - 返回 CapacityData 类型
 * - 模拟大屏产能数据（total, completed, defectRate, timestamp）
 */

import type { CapacityData } from '../types';

/**
 * 模拟 API 请求函数（复用 DataBuffer 的 mock 策略）
 * @description 使用 setTimeout 模拟网络延迟和假数据
 *
 * 📌 模拟策略：
 * - 延迟 200 ~ 500ms（模拟真实网络）
 * - 随机生成 capacity 数据（符合大屏场景）
 */
export const fetchCapacityData = async (): Promise<CapacityData> => {
  // ✅ 模拟网络延迟（200 ~ 500ms）
  await new Promise<void>((resolve) => {
    const delay = Math.floor(Math.random() * 300) + 200;
    setTimeout(resolve, delay);
  });

  // ✅ 随机生成 CapacityData（符合大屏场景）
  const mockData: CapacityData = {
    total: 1000 + Math.floor(Math.random() * 50), // 1000 ~ 1050
    completed: Math.floor(Math.random() * 900), // 0 ~ 900
    completionRate: 0.8 + Math.random() * 0.15, // 0.8 ~ 0.95
    defectRate: 0.02 + Math.random() * 0.03, // 0.02 ~ 0.05
    timestamp: Date.now(),
  };

  return mockData;
};
