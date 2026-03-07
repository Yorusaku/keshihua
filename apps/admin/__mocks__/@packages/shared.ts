/**
 * Mock @packages/shared
 * 阶段：🟢 绿灯阶段（完整实现）
 *
 * 📌 Mock 策略：
 * - 拦截 DataBuffer.getInstance().getSnapshot()
 * - 返回模拟 AGV 数据数组
 * - Mock useAgvListQuery 和 fetchAgvList
 * - Mock useAddAgvMutation 和 addAgv
 */

import { ref, type Ref } from 'vue';
import { vi } from 'vitest';
import type { IAgvListParams, IAgvListResponse, IAddAgvPayload, IAgvData } from '@packages/shared';

/**
 * 📦 Mock useAgvListQuery 返回值
 */
export const mockQueryResult = {
  data: ref<IAgvListResponse | undefined>(undefined),
  isLoading: ref(true),
  isError: ref(false),
  error: ref<Error | null>(null),
  refetch: vi.fn(),
};

/**
 * 📦 Mock useAddAgvMutation 返回值
 */
export const mockMutationResult = {
  mutate: vi.fn(),
  isPending: ref(false),
  isSuccess: ref(false),
  isError: ref(false),
  error: ref<Error | null>(null),
  reset: vi.fn(),
};

/**
 * 📦 Mock useQueryClient（用于验证缓存失效）
 */
export const mockQueryClient = {
  clear: vi.fn(),
  invalidateQueries: vi.fn(),
};

// ✅ 使用 vitest 的 vi.fn() 创建 mock 函数
// @ts-ignore
export const DataBuffer = {
  getInstance: () => ({
    getSnapshot: vi.fn().mockReturnValue([
      {
        id: 'AGV001',
        x: 100,
        y: 200,
        status: 'idle',
      },
      {
        id: 'AGV002',
        x: 150,
        y: 250,
        status: 'moving',
      },
    ]),
  }),
};

// ✅ Mock useAgvListQuery Hook
// @ts-ignore
export const useAgvListQuery = vi.fn(() => mockQueryResult);

// ✅ Mock useAddAgvMutation Hook
// @ts-ignore
export const useAddAgvMutation = vi.fn(() => mockMutationResult);

// ✅ Mock fetchAgvList API
// @ts-ignore
export const fetchAgvList = vi.fn().mockResolvedValue({
  total: 20,
  list: [],
});

// ✅ Mock addAgv API
// @ts-ignore
export const addAgv = vi.fn().mockResolvedValue({
  id: 'AGV-999',
  x: 500,
  y: 500,
  status: 'idle',
  timestamp: Date.now(),
});
