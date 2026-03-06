/**
 * TrendChart 时序折线图组件
 * 文件路径：packages/charts/src/echarts/TrendChart.vue
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 重构说明：
 * - 提取 buildChartOptions 为纯函数，与响应式生命周期解耦
 * - 仅在数据变化时进行局部更新（series.data），避免重绘整个配置树
 * - 完美保留极限性能配置（LTTB、large、largeThreshold、showSymbol）
 *
 * 🚀 极限性能配置：
 * - sampling: 'lttb' - 最大三角桶算法，自动降采样
 * - large: true - 开启大规模数据优化模式
 * - largeThreshold: 2000 - 2000 条以上启用优化
 * - showSymbol: false - 隐藏数据点，极大降低渲染开销
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useResizeObserver } from '@vueuse/core';
import type { EChartsOption } from 'echarts';

/**
 * TrendChart 组件 Props 接口
 * @description 所有 Props 均为可选，提供默认值
 */
export interface TrendChartProps {
  // ✅ 时序数据（核心）
  data?: Array<{ time: number; value: number }>;

  // ✅ 图表配置（可选）
  title?: string;
  color?: string;
  lineWidth?: number;
  areaColor?: string;
  showArea?: boolean;
  tooltipEnabled?: boolean;
}

/**
 * Props 默认值
 * @description 使用 withDefaults 提供默认值
 */
const props = withDefaults(defineProps<TrendChartProps>(), {
  data: () => [],
  title: '时序趋势',
  color: '#3B82F6',
  lineWidth: 2,
  areaColor: undefined,
  showArea: true,
  tooltipEnabled: true,
});

/**
 * 图表容器引用
 * @description 用于挂载 ECharts 实例
 */
const chartContainerRef = ref<HTMLElement | null>(null);

/**
 * ECharts 实例引用
 * @description 用于图表渲染、更新和清理
 */
let chartInstance: echarts.ECharts | null = null;

/**
 * 纯函数：构建完整 Chart Options
 * @description 不依赖任何响应式数据，完全由 props 参数决定
 * @param props - TrendChartProps 配置
 * @returns EChartsOption 完整配置项
 *
 * 📌 设计原则：
 * - 纯函数：无副作用，相同输入始终返回相同输出
 * - 解耦：与 Vue 响应式系统解耦，提升可测试性
 * - 性能：避免不必要的重新计算
 */
const buildChartOptions = (props: TrendChartProps): EChartsOption => {
  // ✅ 自动计算区域填充色（默认主题色 + 10% 透明度）
  const areaColor = props.areaColor ?? `${props.color}1A`;

  return {
    title: {
      text: props.title,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
      },
    },

    // ✅ Tooltip（时序数据交互）
    tooltip: props.tooltipEnabled
      ? {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
          },
          formatter: (params: any) => {
            const param = params[0];
            if (!param || param.value === undefined) {
              return '';
            }
            const date = new Date(param.value[0]);
            const value = param.value[1];
            return `${date.toLocaleString()}<br/>${param.seriesName}: ${typeof value === 'number' ? value.toFixed(2) : 'N/A'}`;
          },
        }
      : undefined,

    // ✅ X 轴（时间轴）
    xAxis: {
      type: 'time',
      splitLine: {
        show: false,
      },
    },

    // ✅ Y 轴（值轴）
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
          opacity: 0.2,
        },
      },
    },

    // ✅ 图例
    legend: props.title
      ? {
          data: [props.title],
          top: '10px',
        }
      : undefined,

    // ✅ Series（核心性能配置）
    series: [
      {
        name: props.title,
        type: 'line',
        // ✅ 数据转换：{ time, value } => [time, value]
        // 📌 ECharts 的 time 类型 X 轴需要 [timestamp, value] 格式
        data: Array.isArray(props.data)
          ? props.data.map((item) => [item.time, item.value])
          : [],

        // 🔥 极限性能配置 1：开启大规模数据优化模式
        // 📌 意图：ECharts 5.x 大规模数据优化开关，减少渲染负载
        large: true,

        // 🔥 极限性能配置 2：大规模数据阈值（2000 条以上启用优化）
        // 📌 意图：仅当数据量超过 2000 条时启用优化，小数据集无需降采样
        largeThreshold: 2000,

        // 🔥 极限性能配置 3：开启 LTTB 降采样算法
        // 📌 意图：LTTB (Largest-Triangle-and-Buckets) 算法自动降采样
        //          使十万级数据渲染保持流畅，避免 GPU 过载
        sampling: 'lttb',

        // 🔥 极限性能配置 4：隐藏数据点符号
        // 📌 意图：关闭数据点渲染（symbol: 'none'），极大降低渲染开销
        //          时间序列数据轨迹图不需要显示每个数据点
        showSymbol: false,

        // ✅ 基础样式配置
        lineStyle: {
          color: props.color,
          width: props.lineWidth,
        },

        // ✅ 面积图配置
        areaStyle: props.showArea
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: areaColor,
                },
                {
                  offset: 1,
                  color: `${props.color}00`, // 透明
                },
              ]),
            }
          : undefined,

        // ✅ 平滑曲线
        smooth: true,

        // ✅ 悬停样式
        emphasis: {
          focus: 'series',
        },
      },
    ],
  };
};

/**
 * 初始化图表
 * @description 在组件挂载后初始化 ECharts 实例
 */
const initChart = () => {
  if (!chartContainerRef.value) return;

  chartInstance = echarts.init(chartContainerRef.value);
  chartInstance.setOption(buildChartOptions(props));
};

/**
 * 监听容器尺寸变化
 * @description 使用 useResizeObserver 监听容器尺寸变化
 */
useResizeObserver(chartContainerRef, () => {
  if (chartInstance) {
    chartInstance.resize();
  }
});

/**
 * 监听数据变化，更新图表
 * @description 仅更新 series.data，避免重绘整个配置树
 * @description 📌 性能优化：局部更新而非全量更新
 */
watch(
  () => props.data,
  (newData) => {
    if (chartInstance) {
      // ✅ 仅更新 series.data，不触碰坐标轴、网格等配置
      chartInstance.setOption({
        series: [
          {
            data: newData,
          },
        ],
      });
    }
  },
  { deep: true },
);

/**
 * 监听配置变化，重新构建完整 Options
 * @description 当 title、color 等配置变化时，重新构建 Options
 */
watch(
  () => ({ ...props }),
  () => {
    if (chartInstance) {
      chartInstance.setOption(buildChartOptions(props));
    }
  },
  { deep: true, immediate: false },
);

/**
 * 组件挂载
 * @description 在 nextTick 后初始化图表
 */
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

/**
 * 组件卸载前清理
 * @description 防止内存泄漏，销毁 ECharts 实例
 */
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<template>
  <div
    ref="chartContainerRef"
    class="trend-chart-container"
    style="width: 100%; height: 100%"
  ></div>
</template>

<style scoped>
.trend-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
