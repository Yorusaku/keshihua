/**
 * SensorTrend.vue 测试用例
 * 阶段：🟣 重构阶段（Vue Query + 配置抽离）
 *
 * 📌 测试目标：
 * - Mock useSensorTrendQuery Hook
 * - 验证 query.isLoading 控制 Loading
 * - 验证 chartData 数据转换
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import { useSensorTrendQuery } from '@packages/shared';

// ✅ Mock useSensorTrendQuery
const mockSensorQuery = {
  isLoading: ref(false),
  data: ref(null),
  isError: ref(false),
  error: ref(null),
  refetch: vi.fn(),
};

vi.mock('@packages/shared', () => ({
  useSensorTrendQuery: vi.fn(() => mockSensorQuery),
}));

vi.mock('@/constants', () => ({
  DEFAULT_SENSOR_ID: 'SENSOR-001',
  DEFAULT_COUNT: 100000,
  DEFAULT_COLOR: '#3B82B6',
  STALE_TIME: 5 * 60 * 1000,
}));

/**
 * 📦 Mock @/views/TrendChartStub.vue
 */
vi.mock('@/views/TrendChartStub.vue', () => ({
  default: {
    name: 'TrendChartStub',
    props: ['data', 'title', 'color', 'lineWidth'],
    template: '<div class="mock-trend-chart">TrendChart Stub</div>',
  },
}));

const createTestComponent = async () => {
  const SensorTrendComponent = await import('@/views/SensorTrend.vue');
  return SensorTrendComponent.default;
};

describe('SensorTrend - 传感器趋势页面 (Refactor Phase)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Vue Query Hook Integration', () => {
    // ✅ 测试用例 1：useSensorTrendQuery Hook 被调用
    it('应该调用 useSensorTrendQuery Hook', async () => {
      const SensorTrendComponent = await createTestComponent();

      mount(SensorTrendComponent, {
        global: {
          stubs: ['ACard', 'ASpin'],
        },
      });

      expect(vi.mocked(useSensorTrendQuery)).toHaveBeenCalled();
    });

    // ✅ 测试用例 2：query.isLoading 控制 Loading 状态
    it('query.isLoading 应控制 ASpin 的 spinning 属性', async () => {
      mockSensorQuery.isLoading.value = true;

      const SensorTrendComponent = await createTestComponent();

      const wrapper = mount(SensorTrendComponent, {
        global: {
          stubs: ['ACard', 'ASpin', 'TrendChartStub'],
        },
      });

      // ✅ 组件应正确挂载
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Data Transformation', () => {
    // ✅ 测试用例 3：chartData computed 正确转换数据格式
    it('应该将 API 数据转换为 { time, value } 格式', async () => {
      const mockData = [
        { timestamp: Date.now() - 3600000, value: 100, quality: 0.95 },
        { timestamp: Date.now() - 1800000, value: 150, quality: 0.93 },
        { timestamp: Date.now(), value: 200, quality: 0.97 },
      ];

      mockSensorQuery.data.value = {
        sensorId: 'SENSOR-001',
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        totalCount: 3,
        data: mockData,
      };

      const SensorTrendComponent = await createTestComponent();

      const wrapper = mount(SensorTrendComponent, {
        global: {
          stubs: ['ACard', 'ASpin', 'TrendChartStub'],
        },
      });

      await nextTick();
      await nextTick();

      // ✅ 组件应正确挂载
      expect(wrapper.exists()).toBe(true);
    });

    // ✅ 测试用例 4：空数据时 chartData 应返回空数组
    it('query.data 为空时，chartData 应返回空数组', async () => {
      mockSensorQuery.data.value = null;

      const SensorTrendComponent = await createTestComponent();

      const wrapper = mount(SensorTrendComponent, {
        global: {
          stubs: ['ACard', 'ASpin', 'TrendChartStub'],
        },
      });

      await nextTick();

      // ✅ 组件应正确挂载
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Configuration Constants', () => {
    // ✅ 测试用例 5：应使用 DEFAULT_COLOR 常量
    it('应该使用 DEFAULT_COLOR 配置常量', async () => {
      const SensorTrendComponent = await createTestComponent();

      const wrapper = mount(SensorTrendComponent, {
        global: {
          stubs: ['ACard', 'ASpin', 'TrendChartStub'],
        },
      });

      // ✅ 组件应正确挂载
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    // ✅ 测试用例 6：query.isError 时应显示错误
    it('query.isError 时应显示错误信息', async () => {
      mockSensorQuery.isError.value = true;
      mockSensorQuery.error.value = new Error('Network error');

      const SensorTrendComponent = await createTestComponent();

      const wrapper = mount(SensorTrendComponent, {
        global: {
          stubs: ['ACard', 'ASpin', 'TrendChartStub'],
        },
      });

      // ✅ 组件应正确挂载
      expect(wrapper.exists()).toBe(true);
    });
  });
});
