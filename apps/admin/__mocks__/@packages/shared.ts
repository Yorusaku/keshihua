/**
 * Mock @packages/shared
 * 阶段：🟢 绿灯阶段（SensorTrend Query Hook 拦截）
 */

import { ref } from 'vue';

// ✅ Mock 数据容器（在模块顶层定义）
let mockSensorTrendData = ref<any>(null);
let mockSensorTrendLoading = ref(true);
let mockSensorTrendError = ref(false);
let mockSensorTrendIsError = ref(false);

/**
 * 📌 清理 Mock 数据
 */
export const clearMockSensorTrendData = () => {
  mockSensorTrendData = ref<any>(null);
  mockSensorTrendLoading = ref(true);
  mockSensorTrendError = ref(false);
  mockSensorTrendIsError = ref(false);
};

/**
 * 📌 使用者可配置的 Mock 返回值
 * @description 用于控制 useSensorTrendQuery 返回的测试数据
 */
export const mockSensorTrendQueryResult = {
  get data() {
    return mockSensorTrendData;
  },
  set data(value: any) {
    mockSensorTrendData = value;
  },
  get isLoading() {
    return mockSensorTrendLoading;
  },
  set isLoading(value: boolean) {
    mockSensorTrendLoading = value;
  },
  get isError() {
    return mockSensorTrendIsError;
  },
  set isError(value: boolean) {
    mockSensorTrendIsError = value;
  },
  get error() {
    return mockSensorTrendError;
  },
  set error(value: any) {
    mockSensorTrendError = value;
  },
};

/**
 * 📌 Mock refetch 函数
 */
export const mockRefetch = vi.fn?.() => Promise.resolve();

/**
 * 📌 实际的 useSensorTrendQuery 实现
 * @description 返回配置化的 Mock 结果
 */
export const actualSensorTrendQuery = (params: any) => {
  return {
    data: mockSensorTrendData,
    isLoading: mockSensorTrendLoading,
    isError: mockSensorTrendIsError,
    error: mockSensorTrendError,
    refetch: mockRefetch,
  };
};

// ✅ 导出所有 API（使用 vi.fn 拦截调用）
export const useSensorTrendQuery = vi.fn(actualSensorTrendQuery);

// ✅ 导出传感器 API（用于测试数据生成）
export * from '@packages/shared/src/network/api/sensor';
export * from '@packages/shared/src/network/queries/useSensorQuery';
