/**
 * 测试帮助函数（Mock 工具）
 * 文件路径：apps/dashboard/src/views/components/__tests__/helpers.ts
 * 阶段：🔴 红灯阶段（测试先行）
 *
 * 📌 工具说明：
 * - 提供 Mock useCapacityQuery 的辅助函数
 */

import { ref } from 'vue';
import { vi } from 'vitest';

/**
 * 🚨 Mock CapacityData 类型（与 @packages/shared 对齐）
 */
export interface CapacityData {
  total: number;
  completed: number;
  completionRate: number;
  defectRate: number;
  timestamp: number;
}

/**
 * 🚨 Mock useCapacityQuery Hook（动态返回 Ref）
 * @description 返回一个可动态控制的 Mock Hook
 */
export const createMockUseCapacityQuery = () => {
  const data = ref<CapacityData | undefined>(undefined);
  const isLoading = ref(false);
  const isError = ref(false);

  const mockUseCapacityQuery = () => ({
    data,
    isLoading,
    isError,
    refetch: vi.fn(),
  });

  return {
    mockUseCapacityQuery,
    data,
    isLoading,
    isError,
  };
};
