/**
 * Mock @packages/shared
 * 阶段：🟣 重构阶段（Vue Query Hook 拦截）
 */

import { ref } from 'vue';
import type { UseQueryResult } from '@tanstack/vue-query';

// ✅ Mock useAgvListQuery 返回值
const mockAgvListQueryResult = {
  data: ref({ total: 20, list: [] }),
  isLoading: ref(true),
  isError: ref(false),
  error: ref(null),
  refetch: vi.fn(),
};

// ✅ Mock useCapacityReportQuery 返回值
const mockReportQueryResult = {
  data: ref([]),
  isLoading: ref(true),
  isError: ref(false),
  error: ref(null),
  refetch: vi.fn(),
};

// ✅ Mock useAgvMutation 返回值
const mockAgvMutationResult = {
  mutate: vi.fn(),
  isPending: ref(false),
  isSuccess: ref(false),
  isError: ref(false),
  error: ref(null),
  reset: vi.fn(),
};

// ✅ Mock useCapacityMutation 返回值
const mockCapacityMutationResult = {
  mutate: vi.fn(),
  isPending: ref(false),
  isSuccess: ref(false),
  isError: ref(false),
  error: ref(null),
  reset: vi.fn(),
};

// ✅ 实际的 API 返回值（用于非 Mock 测试）
const actualAgvListQuery = (params: any) => ({
  data: ref({ total: 20, list: [] }),
  isLoading: ref(true),
  isError: ref(false),
  error: ref(null),
  refetch: vi.fn(),
});

const actualReportQuery = (params: any) => ({
  data: ref([]),
  isLoading: ref(true),
  isError: ref(false),
  error: ref(null),
  refetch: vi.fn(),
});

const actualAgvMutation = () => ({
  mutate: vi.fn(),
  isPending: ref(false),
  isSuccess: ref(false),
  isError: ref(false),
  error: ref(null),
  reset: vi.fn(),
});

const actualCapacityMutation = () => ({
  mutate: vi.fn(),
  isPending: ref(false),
  isSuccess: ref(false),
  isError: ref(false),
  error: ref(null),
  reset: vi.fn(),
});

// ✅ 导出所有 API（使用 vi.fn 拦截调用）
export const useAgvListQuery = vi.fn(actualAgvListQuery);
export const useCapacityReportQuery = vi.fn(actualReportQuery);
export const useAgvMutation = vi.fn(actualAgvMutation);
export const useCapacityMutation = vi.fn(actualCapacityMutation);

// ✅ 导出原始 API（用于非 Mock 测试）
export const getMockAgvListQueryResult = () => mockAgvListQueryResult;
export const getMockReportQueryResult = () => mockReportQueryResult;
export const getMockAgvMutationResult = () => mockAgvMutationResult;
export const getMockCapacityMutationResult = () => mockCapacityMutationResult;

// ✅ 导出所有 API（用于导入测试）
export * from '@packages/shared/src/network/api/agv';
export * from '@packages/shared/src/network/api/report';
export * from '@packages/shared/src/network/queries/useAgvMutation';
export * from '@packages/shared/src/network/queries/useAgvListQuery';
export * from '@packages/shared/src/network/queries/useReportQuery';
export * from '@packages/shared/src/network/queries/useCapacityQuery';
