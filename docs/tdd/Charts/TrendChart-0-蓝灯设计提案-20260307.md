# TrendChart-0-蓝灯设计提案
**日期**：2026年3月7日  
**模块**：`@packages/charts` - `TrendChart.vue`  
**版本**：V5 终极架构师正式版  
**阶段**：🔵 蓝灯阶段（设计对齐）

---

## 📋 一、模块概述

### 1.1 模块定位

| 项目 | 说明 |
|------|------|
| **模块名称** | `TrendChart` |
| **文件路径** | `packages/charts/src/echarts/TrendChart.vue` |
| **模块类型** | 纯展示型组件（Dumb Component） |
| **核心职责** | 高性能时序折线图渲染（支持数万条数据） |
| **依赖技术** | ECharts 5.x + `@vueuse/core` |

### 1.2 设计目标

| 目标 | 说明 |
|------|------|
| **极限性能** | 支持 10,000+ 条传感器时序数据实时渲染 |
| **智能降采样** | 内置 `lttb`（最大三角桶）算法，自动降采样 |
| **自适应** | 响应容器尺寸变化，自动调整图表布局 |
| **零内存泄漏** | 组件卸载时正确清理 ECharts 实例 |

---

## 🔵 二、组件职责与边界

### 2.1 职责定义（SOLID 原则）

| 原则 | 实践 |
|------|------|
| **单一职责** | 仅负责图表渲染，不处理数据请求 |
| **开闭原则** | 通过 props 配置图表行为，不修改源码 |
| **依赖倒置** | 依赖 ECharts 抽象接口，不依赖具体实现 |

### 2.2 负责任

| 责任 | 说明 |
|------|------|
| ✅ 数据接收 | 通过 props 接收时序数据 |
| ✅ 图表渲染 | 使用 ECharts 渲染折线图 |
| ✅ 降采样处理 | 自动应用 `lttb` 算法 |
| ✅ 自适应调整 | 响应容器尺寸变化 |
| ✅ 生命周期管理 | 正确初始化与销毁 ECharts 实例 |

### 2.3 不负责任

| 责任 | 说明 | 委托给 |
|------|------|--------|
| ❌ 数据请求 | 不负责 API 调用 | `@packages/shared/network` |
| ❌ 数据处理 | 不负责数据聚合 | 业务层（Dashboard） |
| ❌ 业务逻辑 | 不包含任何业务判断 | 业务层组件 |

---

## 🔵 三、Props 设计

### 3.1 Props 接口定义

```typescript
/**
 * TrendChart 组件 Props 接口
 * @description 所有 Props 均为可选（使用 Partial 模式），提供默认值
 */
export interface TrendChartProps {
  // ✅ 时序数据（核心）
  data: Array<{ time: number; value: number }>;

  // ✅ 图表配置（可选）
  title?: string;              // 图表标题，默认 '时序趋势'
  color?: string;              // 主题色，默认 '#3B82F6'
  lineWidth?: number;          // 线宽，默认 2
  areaColor?: string;          // 区域填充色（默认与主题色同色透明度 0.1）
  showArea?: boolean;          // 是否显示面积，默认 true
  tooltipEnabled?: boolean;    // 是否显示 Tooltip，默认 true
}
```

### 3.2 Props 默认值

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `Array<{ time: number; value: number }>` | `[]` | 必填，时序数据 |
| `title` | `string` | `'时序趋势'` | 图表标题 |
| `color` | `string` | `'#3B82F6'` | 主题色（Hex 或 RGB） |
| `lineWidth` | `number` | `2` | 折线宽度（像素） |
| `areaColor` | `string` | `color + '1A'`（10% 透明度） | 区域填充色 |
| `showArea` | `boolean` | `true` | 是否显示面积图 |
| `tooltipEnabled` | `boolean` | `true` | 是否显示 Tooltip |

---

## 🔵 四、极限性能配置（ECharts Options）

### 4.1 核心配置项

```typescript
{
  // ✅ 全局配置
  title: {
    text: props.title ?? '时序趋势',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
  },

  // ✅ Tooltip（时序数据交互）
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
    },
    formatter: (params: any) => {
      const param = params[0];
      const date = new Date(param.value[0]);
      return `${date.toLocaleString()}<br/>${param.seriesName}: ${param.value[1]}`;
    },
  },

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
  legend: {
    data: [props.title ?? '时序趋势'],
    top: '10px',
  },

  // ✅Series（核心性能配置）
  series: [
    {
      name: props.title ?? '时序趋势',
      type: 'line',
      data: props.data,

      // 🔥 极限性能配置 1：开启大规模数据优化模式
      large: true,

      // 🔥 极限性能配置 2：大规模数据阈值（2000 条以上启用优化）
      largeThreshold: 2000,

      // 🔥 极限性能配置 3：开启 LTTB 降采样算法
      sampling: 'lttb',

      // 🔥 极限性能配置 4：隐藏数据点符号（极大降低渲染开销）
      showSymbol: false,

      // ✅ 基础样式配置
      lineStyle: {
        color: props.color ?? '#3B82F6',
        width: props.lineWidth ?? 2,
      },

      // ✅ 面积图配置
      areaStyle: props.showArea
        ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: props.areaColor ?? (props.color ?? '#3B82F6') + '1A',
              },
              {
                offset: 1,
                color: (props.color ?? '#3B82F6') + '00', // 透明
              },
            ]),
          }
        : undefined,

      // ✅ 平滑曲线（可选）
      smooth: true,

      // ✅ 悬停样式
      emphasis: {
        focus: 'series',
      },
    },
  ],
}
```

### 4.2 性能配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `large` | `true` | 开启大规模数据优化模式 |
| `largeThreshold` | `2000` | 2000 条数据以上启用优化 |
| `sampling` | `'lttb'` | 使用最大三角桶算法降采样 |
| `showSymbol` | `false` | 隐藏数据点符号（性能关键） |

---

## 🔵 五、自适应与生命周期管理

### 5.1 使用 @vueuse/core

```typescript
import { useResizeObserver } from '@vueuse/core';
import { onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
```

### 5.2 生命周期管理

```typescript
// ✅ 图表实例引用
let chartInstance: echarts.ECharts | null = null;

// ✅ 容器元素引用
const chartContainerRef = ref<HTMLElement | null>(null);

// ✅ 初始化图表
const initChart = () => {
  if (!chartContainerRef.value) return;
  
  chartInstance = echarts.init(chartContainerRef.value);
  chartInstance.setOption(getChartOptions());
};

// ✅ 监听容器尺寸变化
useResizeObserver(chartContainerRef, (entries) => {
  if (chartInstance) {
    chartInstance.resize();
  }
});

// ✅ 组件挂载后初始化
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

// ✅ 组件卸载前清理（防止内存泄漏）
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
```

### 5.3 响应式更新

```typescript
// ✅ 监听 Props 变化，更新图表
watch(
  () => props.data,
  (newData) => {
    if (chartInstance) {
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
```

---

## 🔵 六、红灯阶段测试覆盖规划

### 6.1 测试文件结构

```
packages/charts/src/echarts/
├── TrendChart.vue                  # 业务代码（蓝灯后实现）
└── __tests__/
    ├── TrendChart.test.ts         # 单元测试
    └── setup.ts                   # 测试环境配置
```

### 6.2 ECharts Mock 策略

#### 6.2.1 Mock `echarts.init`

```typescript
// src/__mocks__/echarts.ts
const mockInit = vi.fn<[], echarts.ECharts>();
const mockSetOption = vi.fn<[_option: any], void>();
const mockResize = vi.fn<[], void>();
const mockDispose = vi.fn<[], void>();

const mockChart = {
  setOption: mockSetOption,
  resize: mockResize,
  dispose: mockDispose,
} as unknown as echarts.ECharts;

export const echarts = {
  init: (...args: Parameters<typeof echarts.init>) => {
    mockInit(...args);
    return mockChart;
  },
} as unknown as typeof echarts;
```

#### 6.2.2 Mock `useResizeObserver`

```typescript
// 在测试中 Mock
vi.mock('@vueuse/core', async (ivité) => {
  const actual = await віте()
  return {
    ...actual,
    useResizeObserver: vi.fn(),
  }
})
```

### 6.3 测试用例规划

#### 6.3.1 `TrendChart.test.ts` 测试矩阵

| 测试用例编号 | 测试场景 | 预期结果 |
|--------------|----------|----------|
| **TC-01** | 组件挂载后，应调用 `echarts.init` | ✅ `mockInit` 被调用 |
| **TC-02** | 组件挂载后，应调用 `setOption` 传入正确 Options | ✅ `mockSetOption` 被调用 |
| **TC-03** | Options 应包含 `series[0].large === true` | ✅ 通过 |
| **TC-04** | Options 应包含 `series[0].largeThreshold === 2000` | ✅ 通过 |
| **TC-05** | Options 应包含 `series[0].sampling === 'lttb'` | ✅ 通过 |
| **TC-06** | Options 应包含 `series[0].showSymbol === false` | ✅ 通过 |
| **TC-07** | 数据变化时，应调用 `setOption` 更新数据 | ✅ `mockSetOption` 被调用 |
| **TC-08** | 容器尺寸变化时，应调用 `resize` | ✅ `mockResize` 被调用 |
| **TC-09** | 组件卸载前，应调用 `dispose` | ✅ `mockDispose` 被调用 |
| **TC-10** | 再次挂载组件（销毁后），应重新调用 `init` | ✅ `mockInit` 再次被调用 |
| **TC-11** | Props `title` 变化时，Options.title 应更新 | ✅ 通过 |
| **TC-12** | Props `color` 变化时，Options.series[0].lineStyle.color 应更新 | ✅ 通过 |

---

## 🔵 七、文件结构规划

```
packages/charts/
├── src/
│   ├── echarts/
│   │   ├── TrendChart.vue           # 🆕 TrendChart 组件
│   │   └── __tests__/
│   │       ├── TrendChart.test.ts   # 🆕 测试用例
│   │       └── setup.ts             # 🆕 测试环境配置
│   └── index.ts                     # ✅ 导出 TrendChart
└── package.json
```

---

## 🔵 八、依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│              TrendChart.vue (纯展示组件)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Props:                                                 │ │
│  │  - data: Array<{time, value}>  ← 时序数据              │ │
│  │  - title: string                ← 标题                 │ │
│  │  - color: string                ← 主题色               │ │
│  │                                                         │ │
│  │  Internal:                                              │ │
│  │  - useResizeObserver ← 监听容器尺寸                    │ │
│  │  - onBeforeUnmount ← 清理 ECharts 实例                │ │
│  │  - echarts.init + setOption ← 渲染图表                │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ECharts 5.x (渲染引擎)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  - init(container) ← 初始化图表                         │ │
│  │  - setOption(option) ← 设置配置                         │ │
│  │  - resize() ← 自适应调整                                │ │
│  │  - dispose() ← 销毁实例                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│             @vueuse/core (响应式工具库)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  - useResizeObserver ← 尺寸监听                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔵 九、红灯阶段任务清单

| 任务 | 文件 | 状态 |
|------|------|------|
| **创建测试目录** | `packages/charts/src/echarts/__tests__/` | 🔵 待执行 |
| **实现 Mock echarts** | `packages/charts/src/__mocks__/echarts.ts` | 🔵 待执行 |
| **编写测试用例** | `packages/charts/src/echarts/__tests__/TrendChart.test.ts` | 🔵 待执行 |
| **编写测试环境配置** | `packages/charts/src/echarts/__tests__/setup.ts` | 🔵 待执行 |
| **实现占位组件** | `packages/charts/src/echarts/TrendChart.vue` | 🔵 待执行 |

---

> 以上是该需求的交互与技术设计提案，请问是否同意？（同意后我将进入红灯阶段，编写对应自动化测试用例）
