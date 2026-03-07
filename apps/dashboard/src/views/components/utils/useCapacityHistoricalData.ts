/**
 * useCapacityHistoricalData Composable
 * 文件路径：apps/dashboard/src/views/components/utils/useCapacityHistoricalData.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 功能说明：
 * - 封装历史时序数据的初始化、管理与更新逻辑
 * - 提供 watch 追加逻辑与 80,000 条防内存溢出截断
 *
 * 📌 Composable 约束：
 * - 输入：useCapacityQuery().data（产能数据）
 * - 输出：historicalData（响应式历史数组）、formatDefectRate（格式化方法）
 *
 * 🚀 性能优化：shallowRef + triggerRef
 * - 使用 shallowRef 避免 Vue 为 50,000+ 个对象创建深层 Proxy 代理
 * - ECharts 不需要响应式数据，只需数组引用即可
 * - 手动调用 triggerRef 通知 Vue 更新，精确控制重渲染时机
 */

import { shallowRef, triggerRef, watch } from 'vue';
import type { Ref, ShallowRef } from 'vue';
import type { CapacityData } from '@packages/shared';

/**
 * useCapacityHistoricalData
 * @description 封装历史时序数据的初始化、管理与更新逻辑
 * @param queryData - useCapacityQuery().data（响应式产能数据）
 * @returns {
 *   historicalData: ShallowRef<Array<{ time: number; value: number }>>,
 *   formatDefectRate: (rate: number | undefined) => string
 * }
 */
export const useCapacityHistoricalData = (
  queryData: Ref<CapacityData | undefined>
) => {
  /**
   * 📦 浅层响应式引用：历史时序数据（50,000+ 条）
   * @description 使用 shallowRef 避免 Vue 为每个对象创建 Proxy 代理
   * - Vue 只追踪 .value 引用变化，不追踪数组内部变化
   * - 需要手动调用 triggerRef() 通知 Vue 更新
   * - 适用于 ECharts 等不需要响应式的海量数据场景
   */
  const historicalData = shallowRef<Array<{ time: number; value: number }>>([]);

  /**
   * 📦 初始化历史数据
   * @description 使用 Istanbul 随机数生成器模拟产能数据（可替换为真实数据源）
   */
  const initializeHistoricalData = (): Array<{ time: number; value: number }> => {
    const data: Array<{ time: number; value: number }> = [];
    const now = Date.now();
    const startTime = now - 12 * 60 * 60 * 1000; // 12 小时前

    // ✅ for 循环生成 50,000 条数据
    for (let i = 0; i < 50000; i++) {
      const time = startTime + i * 864; // 每条间隔 864ms
      const value = 1000 + Math.random() * 50; // 模拟产能波动（1000 ~ 1050）

      data.push({ time, value });
    }

    return data;
  };

  /**
   * 📦 格式化不良率（Convert 0.02 → "2.0%"）
   * @param rate - 不良率（0 ~ 1）
   * @returns 格式化后的字符串（保留 1 位小数 + %）
   */
  const formatDefectRate = (rate: number | undefined): string => {
    if (rate === undefined) return '0.0';
    return (rate * 100).toFixed(1);
  };

  /**
   * 📦 监听 useCapacityQuery.data 变化，追加新数据到 historicalData
   * @description 每次静默轮询（30s）拿到新数据后，将其追加到历史数据末尾
   *
   * 📌 追加策略：
   * - 使用 timestamp 作为 time 字段
   * - 使用 completed 作为 value 字段（产能趋势核心指标）
   *
   * 🛡️ 防内存泄漏保护：
   * - MAX_POINTS: 80,000 - 最大历史数据点数
   * - slice 截断旧数据，保留最新 80,000 条
   *
   * 📌 意图注释：
   * - watch 监听：响应式更新历史数据，确保 TrendChart 实时渲染最新数据
   * - slice 截断：防止长时间运行应用内存溢出，自动清理过期数据
   */
  const MAX_POINTS = 80000; // 🔥 最大历史数据点数（防止内存溢出）

  // ✅ 立即初始化历史数据（immediate: true 会先执行一次）
  historicalData.value = initializeHistoricalData();

  watch(
    queryData,
    (newData) => {
      console.log('[useCapacityHistoricalData] newData:', newData);
      console.log('[useCapacityHistoricalData] historicalData length before:', historicalData.value.length);

      if (newData) {
        // ✅ 追加新数据到 historicalData 末尾
        // 📌 使用 timestamp 作为 time 字段，completed 作为 value 字段
        historicalData.value.push({
          time: newData.timestamp,
          value: newData.completed,
        });

        console.log('[useCapacityHistoricalData] historicalData length after:', historicalData.value.length);

        // 🔥 防内存泄漏：检查数组长度，超过 80,000 条时截断旧数据
        // 📌 意图：限制历史数据最大长度，防止长时间运行导致内存溢出
        if (historicalData.value.length > MAX_POINTS) {
          // ✅ slice 截断：保留最新 80,000 条（高性能数组操作）
          historicalData.value = historicalData.value.slice(
            historicalData.value.length - MAX_POINTS
          );
        }

        // ✅ 神之一手：手动通知 Vue "我的数据变了，去通知 TrendChart 重绘吧"
        // 📌 shallowRef 不会自动追踪数组内部变化，需要手动触发更新
        triggerRef(historicalData);
      }
    },
    { immediate: true }, // ✅ immediate: true - 立即执行一次（初始化数据）
  );

  return {
    historicalData,
    formatDefectRate,
  };
};
