/**
 * TrendChart 组件测试用例
 * 文件路径：packages/charts/src/echarts/__tests__/TrendChart.test.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试说明：
 * - Mock ECharts 的 init、setOption、resize、dispose 方法
 * - Mock useResizeObserver 以便触发 resize 回调
 * - 绿灯阶段：TrendChart.vue 已实现，应通过测试
 *
 * 🚨 V5 规约强制约束：
 * - 测试必须覆盖所有极限性能配置
 * - 测试必须覆盖生命周期管理（防止内存泄漏）
 * - 测试必须覆盖自适应设计
 */

import { describe, it, expect, vi, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TrendChart from '../TrendChart.vue';

// ✅ Mock 模块导入（已在 setup.ts 中定义）
import { init, type ECharts } from 'echarts';
import { useResizeObserver } from '@vueuse/core';

describe('TrendChart - 时序折线图组件', () => {
  // ✅ 每个测试后重置 setOption 的 mock calls，确保测试独立
  afterEach(() => {
    (init().setOption as Mock).mockClear();
  });

  describe('Mounting & Rendering (挂载与渲染)', () => {
    it('组件挂载后，应调用 echarts.init 进行初始化', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '测试图表',
          color: '#3B82F6',
        },
      });

      // ✅ 等待 nextTick 确保组件挂载完成
      await nextTick();

      // ✅ 断言：echarts.init 应被调用
      expect(init).toHaveBeenCalled();
    });

    it('组件挂载后，应调用 setOption 传入正确配置', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#3B82F6',
        },
      });

      await nextTick();

      // ✅ 断言：setOption 应被调用
      expect(init().setOption).toHaveBeenCalled();
    });
  });

  describe('极限性能配置断言 (ECharts Options)', () => {
    it('Options 中 series[0].sampling 应为 lttb（最大三角桶降采样）', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#3B82F6',
        },
      });

      await nextTick();

      // ✅ 获取 setOption 的调用参数
      const callArgs = (init().setOption as Mock).mock.calls[0][0];
      const series = callArgs.series?.[0];

      // ✅ 断言：sampling 必须为 'lttb'
      expect(series?.sampling).toBe('lttb');
    });

    it('Options 中 series[0].large 应为 true（开启大规模数据优化）', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#3B82F6',
        },
      });

      await nextTick();

      const callArgs = (init().setOption as Mock).mock.calls[0][0];
      const series = callArgs.series?.[0];

      // ✅ 断言：large 必须为 true
      expect(series?.large).toBe(true);
    });

    it('Options 中 series[0].largeThreshold 应为 2000（2000 条以上启用优化）', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#3B82F6',
        },
      });

      await nextTick();

      const callArgs = (init().setOption as Mock).mock.calls[0][0];
      const series = callArgs.series?.[0];

      // ✅ 断言：largeThreshold 必须为 2000
      expect(series?.largeThreshold).toBe(2000);
    });

    it('Options 中 series[0].showSymbol 应为 false（隐藏数据点）', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#3B82F6',
        },
      });

      await nextTick();

      const callArgs = (init().setOption as Mock).mock.calls[0][0];
      const series = callArgs.series?.[0];

      // ✅ 断言：showSymbol 必须为 false
      expect(series?.showSymbol).toBe(false);
    });
  });

  describe('响应式断言 (Reactive Updates)', () => {
    it('data Props 变化时，应调用 setOption 更新数据', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#3B82F6',
        },
      });

      await nextTick();

      const initialCalls = (init().setOption as Mock).mock.calls.length;

      // ✅ 更新 data（确保创建新数组引用）
      await wrapper.setProps({
        data: [{ time: 2000, value: 20 }], // 新数组引用
      });

      await nextTick();

      // ✅ 断言：setOption 应被再次调用（更新数据）
      expect((init().setOption as Mock).mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  describe('自适应断言 (Responsive Resize)', () => {
    it('容器尺寸变化时，应调用 resize 方法', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#3B82F6',
        },
      });

      await nextTick();

      // ✅ 获取 useResizeObserver 的回调
      const resizeCallback = vi.mocked(useResizeObserver).mock.calls[0]?.[1];

      // ✅ 模拟 resize 回调触发
      if (resizeCallback) {
        // @ts-ignore
        resizeCallback([] as ResizeObserverEntry[]);
      }

      // ✅ 断言：resize 方法应被调用
      expect(init().resize).toHaveBeenCalled();
    });
  });

  describe('卸载断言 (Memory Management)', () => {
    it('组件卸载时，应调用 dispose 方法防止内存泄漏', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#3B82F6',
        },
      });

      await nextTick();

      // ✅ 卸载组件
      await wrapper.unmount();

      // ✅ 断言：dispose 方法应被调用
      expect(init().dispose).toHaveBeenCalled();
    });
  });

  describe('配置项断言 (Configuration Props)', () => {
    it('Props title 应影响图表的 title 配置', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '定制标题',
          color: '#3B82F6',
        },
      });

      await nextTick();

      const callArgs = (init().setOption as Mock).mock.calls[0][0];

      // ✅ 断言：title 应为 '定制标题'
      expect(callArgs.title?.text).toBe('定制标题');
    });

    it('Props color 应影响 series.lineStyle.color', async () => {
      const wrapper = mount(TrendChart, {
        props: {
          data: [{ time: 1000, value: 10 }],
          title: '产量趋势',
          color: '#EF4444', // 红色
        },
      });

      await nextTick();

      const callArgs = (init().setOption as Mock).mock.calls[0][0];
      const series = callArgs.series?.[0];

      // ✅ 断言：lineStyle.color 应为 '#EF4444'
      expect(series?.lineStyle?.color).toBe('#EF4444');
    });
  });
});
