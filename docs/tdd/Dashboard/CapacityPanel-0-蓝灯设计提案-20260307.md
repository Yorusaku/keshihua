# CapacityPanel-0-蓝灯设计提案
**日期**：2026年3月7日  
**模块**：`apps/dashboard` - `CapacityPanel.vue`  
**阶段**：🔵 蓝灯阶段（设计对齐）  
**里程碑**：Milestone 2 - 宏观大盘与状态调度（最终战）

---

## 📋 一、交付文件清单（目录结构）

| 文件路径 | 类型 | 说明 |
|----------|------|------|
| `apps/dashboard/src/views/components/CapacityPanel.vue` | 🆕 创建 | 宏观产能 HUD 面板组件 |
| `apps/dashboard/src/views/components/__tests__/CapacityPanel.test.ts` | 🔴 创建 | 测试用例（红灯阶段） |
| `apps/dashboard/src/views/Dashboard.vue` | 🔧 修改 | 主视图集成 CapacityPanel |
| `docs/tdd/Dashboard/CapacityPanel-0-蓝灯设计提案-20260307.md` | 📄 当前 | 本设计提案文档 |

---

## 🔵 二、核心设计说明

### 2.1 面板结构与样式（HUD UI）

#### 设计目标
- **位置**：左上角悬浮，`z-index: 10` 保证在 AGV Canvas 之上
- **风格**：工业科幻感 HUD（Holographic User Display）
  - 半透明深色背景（`rgba(0, 0, 0, 0.7)`）
  - 科技感边框（霓虹蓝色发光边框 `border: 1px solid rgba(59, 130, 246, 0.5)`）
  - 霓虹发光字体（`text-shadow: 0 0 10px rgba(59, 130, 246, 0.8)`）
  - 底部渐变蒙版（`linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))`）

#### 布局结构

```markdown
CapacityPanel (绝对定位悬浮容器)
├── 上半部分：数字指标区（Metrics Dashboard）
│   ├── 容器：`metrics-container`（flex 行布局）
│   ├── 指标卡片 1：`total`（总数）
│   │   ├── 图标：🏭
│   │   ├── 标签：`总产能`
│   │   ├── 数值：`{{ capacity?.total }}`
│   │   └── 单位：`台`
│   ├── 指标卡片 2：`completed`（完成数）
│   │   ├── 图标：✅
│   │   ├── 标签：`已完成`
│   │   ├── 数值：`{{ capacity?.completed }}`
│   │   └── 单位：`台`
│   └── 指标卡片 3：`defectRate`（不良率）
│       ├── 图标：⚠️
│       ├── 标签：`不良率`
│       ├── 数值：`{{ formatDefectRate(capacity?.defectRate) }}`
│       └── 单位：`%`
├── 下半部分：时序折线图区（Trend Chart）
│   └── 容器：`chart-container`（占满剩余高度）
│       └── <TrendChart :data="historicalData" :title="产能趋势" />
└── 加载状态指示器（可选）
    ├── Loading 态：Spinner + "数据加载中..."
    ├── Error 态：错误图标 + "数据加载失败"
    └── Empty 态：空状态图标 + "暂无数据"
```

#### CSS 核心样式（伪代码）

```css
.capacity-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 400px;
  height: 500px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.metrics-container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  gap: 10px;
}

.metric-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px 10px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
}

.metric-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.chart-container {
  flex: 1;
  position: relative;
  padding: 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
}
```

---

### 2.2 状态调度与绑定（Vue Query 集成）

#### 数据流设计

```typescript
// 📌 数据流清图：
// 1. useCapacityQuery() → 启动 30 秒静默轮询
// 2. queryResult.data → 存储最新 CapacityData（缓存）
// 3. capacity.value = queryResult.data → 组件响应式引用
// 4. <CapacityPanel> UI → 响应式渲染 capacity 的三个指标
```

#### Vue Query 绑定

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCapacityQuery } from '@packages/shared';

// ✅ Vue Query 查询结果（自动管理 Loading/Error 状态）
const queryResult = useCapacityQuery();

// ✅ 响应式容量数据引用
const capacity = ref<CapacityData | undefined>(undefined);

// ✅ 只监听 data 变化（避免 isLoading/isError 等状态干扰）
import { watch } from 'vue';
watch(
  () => queryResult.data.value,
  (newData) => {
    if (newData) {
      capacity.value = newData;
    }
  },
  { immediate: true },
);

// ✅ 格式化不良率（0.02 → 2.0%）
const formatDefectRate = (rate: number | undefined) => {
  return rate !== undefined ? (rate * 100).toFixed(1) : '0.0';
};
</script>
```

#### UI 状态映射

| Query 状态 | UI 显示 |
|-----------|---------|
| `isLoading = true` | Spinner + "数据加载中..."（静默轮询不显示） |
| `isError = true` | ❌ 错误图标 + "数据加载失败，请检查网络" |
| `data = undefined` | ⚪ 空状态图标 + "暂无数据" |
| `data = CapacityData` | ✅ 正常显示三个指标卡片 + 下方 TrendChart |

---

### 2.3 海量历史数据模拟与追加（LTTB 极限测试）

#### 设计目标
- **初始化 50,000 条模拟历史数据**（确保超出 `largeThreshold: 2000`）
- **每次轮询追加新数据**至 `historicalData` 末尾
- **TrendChart 实时渲染** `historicalData`（开启 LTTB 降采样）

#### 数据结构

```typescript
interface HistoricalDataPoint {
  time: number;  // 时间戳（毫秒）
  value: number; // 产能数值（可选：total, completed, defectRate）
}
```

#### 初始化策略（50,000 条）

```typescript
// 📌 初始化 50,000 条历史数据（过去 12 小时）
const initializeHistoricalData = (): HistoricalDataPoint[] => {
  const points: HistoricalDataPoint[] = [];
  const now = Date.now();
  const startTime = now - 12 * 60 * 60 * 1000; // 12 小时前

  // ✅ 每 0.864 秒（864ms）生成一条数据（12小时 / 50000条 ≈ 0.864s/条）
  for (let i = 0; i < 50000; i++) {
    const time = startTime + i * 864;
    const value = 1000 + Math.random() * 50; // 模拟产能波动

    points.push({ time, value });
  }

  return points;
};
```

#### 追加策略（每次轮询）

```typescript
// 📌 监听 useCapacityQuery().data 变化，追加新数据
watch(
  () => queryResult.data.value,
  (newData) => {
    if (newData) {
      // ✅ 追加新数据点（仅追加 completed，作为时序趋势）
      historicalData.value.push({
        time: newData.timestamp,
        value: newData.completed,
      });

      // 🛡️ 性能保护：限制历史数据最大长度（防止内存溢出）
      const MAX_POINTS = 80000; // 最多 80,000 条
      if (historicalData.value.length > MAX_POINTS) {
        historicalData.value.splice(0, historicalData.value.length - MAX_POINTS);
      }
    }
  },
);
```

#### TrendChart 绑定

```vue
<TrendChart
  :data="historicalData"
  title="产能趋势"
  color="#3B82F6"
  lineWidth="2"
  :showArea="true"
  :tooltipEnabled="true"
/>
```

---

### 2.4 主视图集成（Dashboard.vue 更新规划）

#### 集成方案（绝对定位悬浮）

```vue
<template>
  <Layout>
    <ScaleBox :width="1920" :height="1080">
      <!-- ✅ ZRender 挂载容器（AGV 渲染器） -->
      <div ref="canvasContainer" class="canvas-container"></div>

      <!-- ✅ CapacityPanel（绝对定位悬浮，左上角） -->
      <CapacityPanel />
    </ScaleBox>
  </Layout>
</template>

<script setup lang="ts">
// ✅ 导入 CapacityPanel
import { defineAsyncComponent } from 'vue';
const CapacityPanel = defineAsyncComponent(() => 
  import('./views/components/CapacityPanel.vue')
);
</script>

<style scoped>
/* ✅ Dashboard 样式更新 */
.canvas-container {
  width: 100%;
  height: 100%;
}

/* ✅ CapacityPanel 绝对定位容器 */
.capacity-panel-wrapper {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10; /* 保证在 AGV Canvas 之上 */
}
</style>
```

#### 红灯阶段 Mock 策略

```typescript
// 🚨 Mock CapacityPanel（红灯阶段占位）
vi.mock('@/views/components/CapacityPanel.vue', () => ({
  default: defineComponent({
    name: 'CapacityPanel',
    template: `<div class="mock-capacity-panel"><slot /></div>`,
  }),
}));
```

---

### 2.5 后续测试覆盖范围规划（红灯阶段）

#### 测试用例规划（核心 7 个）

| 用例编号 | 测试场景 | Mock 策略 | 断言要点 |
|----------|----------|-----------|----------|
| **TC-CP-01** | 组件挂载时，显示 Loading 态 | Mock `useCapacityQuery` 返回 `isLoading: true` | ✅ Spinner 存在<br/>✅ "数据加载中..." 文本存在 |
| **TC-CP-02** | 组件挂载时，显示 Empty 态 | Mock `useCapacityQuery` 返回 `data: undefined` | ✅ 空状态图标存在<br/>✅ "暂无数据" 文本存在 |
| **TC-CP-03** | 组件挂载时，显示 Error 态 | Mock `useCapacityQuery` 返回 `isError: true` | ✅ 错误图标存在<br/>✅ "数据加载失败" 文本存在 |
| **TC-CP-04** | 组件挂载时，正确显示三个指标卡片 | Mock `useCapacityQuery` 返回 `data: CapacityData` | ✅ `total` 指标显示正确<br/>✅ `completed` 指标显示正确<br/>✅ `defectRate` 格式化正确 |
| **TC-CP-05** | 初始化 50,000 条历史数据 | Mock `initializeHistoricalData()` 返回 50,000 条数据 | ✅ `historicalData.length === 50000` |
| **TC-CP-06** | 每次轮询追加新数据 | Mock `useCapacityQuery` 触发 `data` 变化 | ✅ `historicalData.length` 增加 1<br/>✅ 最后一条数据时间为新 `data.timestamp` |
| **TC-CP-07** | TrendChart 组件被正确传递 `historicalData` | Mock `<TrendChart>` 组件 | ✅ `<TrendChart>` 接收到 `:data="historicalData"` |

#### Mock 关键点

```typescript
// ✅ Mock useCapacityQuery
vi.mock('@packages/shared', () => ({
  useCapacityQuery: vi.fn(() => ({
    data: ref<CapacityData | undefined>(undefined),
    isLoading: ref(false),
    isError: ref(false),
  })),
}));

// ✅ Mock initializeHistoricalData
vi.mock('@/views/components/utils/data', () => ({
  initializeHistoricalData: vi.fn(() => Array.from({ length: 50000 }, (_, i) => ({
    time: Date.now() - (50000 - i) * 864,
    value: 1000 + Math.random() * 50,
  }))),
}));
```

---

## 🔵 三、技术栈与依赖确认

| 依赖 | 版本 | 用途 |
|------|------|------|
| `@vueuse/core` | ✅ 已安装 | `useResizeObserver`（TrendChart 依赖） |
| `echarts` | ✅ 已安装 | `TrendChart` 核心依赖 |
| `@tanstack/vue-query` | ✅ 已安装 | `useCapacityQuery` 核心依赖 |
| `@vue/test-utils` | ✅ 已安装 | 测试挂载/卸载 |
| `vitest` | ✅ 已安装 | 单元测试框架 |

---

## 🔵 四、文件结构确认（最终版）

```
apps/dashboard/
├── src/
│   ├── views/
│   │   ├── components/                     🆕 目录
│   │   │   ├── CapacityPanel.vue          🆕 创建（主组件）
│   │   │   ├── __tests__/                 🆕 测试目录
│   │   │   │   └── CapacityPanel.test.ts 🆕 测试用例
│   │   │   └── utils/                     🆕 工具目录（可选）
│   │   │       └── data.ts               🆕 数据初始化工具
│   │   ├── __tests__/
│   │   │   └── Dashboard.test.ts         🔧 修改（Mock CapacityPanel）
│   │   └── Dashboard.vue                 🔧 修改（集成 CapacityPanel）
│   └── components/
│       ├── layout/
│       └── scalebox/
└── package.json
```

---

## 🔵 五、V5 规约强制约束验证

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 禁止业务代码 | 通过 | 本方案仅输出设计文档 |
| ✅ Markdown 格式 | 通过 | 完整 Markdown 文档 |
| ✅ 路径标注 | 通过 | 第一行标注推荐保存路径 |
| ⏳ 测试规划 | 输出中 | 红灯阶段测试用例规划已明确 |
| ⏳ Mock 策略 | 输出中 | 关键 Mock 点已清晰说明 |
| ⏳ 集成方案 | 输出中 | Dashboard.vue 集成方案已明确 |

---

> 以上是该需求的交互与技术设计提案，请问是否同意？（同意后我将进入红灯阶段，编写对应自动化测试用例）
