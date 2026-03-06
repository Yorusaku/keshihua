# CapacityPanel-2-绿灯业务代码
**日期**：2026年3月7日  
**模块**：`apps/dashboard` - `CapacityPanel.vue`  
**版本**：V6 终极业务正式版  
**阶段**：🟢 绿灯阶段（业务实现）

---

## 📋 一、绿灯交付文件清单

| 文件路径 | 修改类型 | 说明 |
|----------|----------|------|
| `apps/dashboard/src/views/components/CapacityPanel.vue` | 🆕 创建 | 宏观产能 HUD 面板组件 |
| `apps/dashboard/src/views/components/utils/data.ts` | 🆕 创建 | 数据初始化工具 |
| `apps/dashboard/src/views/components/__tests__/CapacityPanel.test.ts` | 🆕 创建 | 核心测试用例（6 个测试） |
| `apps/dashboard/src/views/components/__tests__/helpers.ts` | 🆕 创建 | Mock 帮助函数 |
| `docs/tdd/Dashboard/CapacityPanel-2-绿灯业务代码-20260307.md` | 📄 当前 | 本绿灯交付文档 |

---

## 🟢 二、核心业务逻辑实现

### 2.1 数据初始化工具（utils/data.ts）

```typescript
/**
 * 初始化 50,000 条历史时序数据
 * @description 生成过去 12 小时的模拟产能数据（50,000 条）
 */
export const initializeHistoricalData = (): Array<{ time: number; value: number }> => {
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
```

### 2.2 组件视图层（Template & Style）

```vue
<template>
  <div class="capacity-panel">
    <!-- Loading 态 -->
    <div v-if="queryResult.isLoading" class="loading-state">
      <div class="spinner"></div>
      <span class="label">数据加载中...</span>
    </div>

    <!-- Error 态 -->
    <div v-else-if="queryResult.isError" class="error-state">
      <div class="error-icon">❌</div>
      <span class="label">数据加载失败，请检查网络</span>
    </div>

    <!-- Success 态 -->
    <div v-else class="success-state">
      <!-- 上半部分：数字指标区 -->
      <div class="metrics-container">
        <div class="metric-card">...</div> <!-- total -->
        <div class="metric-card">...</div> <!-- completed -->
        <div class="metric-card">...</div> <!-- defectRate -->
      </div>

      <!-- 下半部分：时序折线图区 -->
      <div class="chart-container">
        <TrendChart :data="historicalData" />
      </div>
    </div>
  </div>
</template>
```

### 2.3 CSS 样式（HUD 风格）

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
}
```

### 2.4 状态与追加逻辑（Script Setup）

```typescript
import { ref, watch } from 'vue';
import { useCapacityQuery } from '@packages/shared';
import { TrendChart } from '@packages/charts';
import { initializeHistoricalData } from './utils/data';

/**
 * 📦 响应式引用：历史时序数据（50,000+ 条）
 */
const historicalData = ref<Array<{ time: number; value: number }>>(
  initializeHistoricalData()
);

/**
 * 📦 响应式引用：最新产能数据
 */
const capacity = ref<CapacityData | undefined>(undefined);

/**
 * 📦 useCapacityQuery 查询结果
 */
const queryResult = useCapacityQuery();

/**
 * 📦 格式化不良率（0.02 → "2.0%"）
 */
const formatDefectRate = (rate: number | undefined): string => {
  if (rate === undefined) return '0.0';
  return (rate * 100).toFixed(1);
};

/**
 * 📦 监听 useCapacityQuery.data 变化，追加新数据
 * @description 每次静默轮询（30s）拿到新数据后，追加到历史数据末尾
 *
 * 🛡️ 防内存泄漏保护：
 * - MAX_POINTS: 80,000 - 最大历史数据点数
 * - splice/slice 截断旧数据，防止内存溢出
 */
const MAX_POINTS = 80000;

watch(
  () => queryResult.data.value,
  (newData) => {
    if (newData) {
      // ✅ 更新 capacity 引用
      capacity.value = newData;

      // ✅ 追加新数据
      historicalData.value.push({
        time: newData.timestamp,
        value: newData.completed,
      });

      // 🔥 防内存泄漏：超过 80,000 条时截断旧数据
      if (historicalData.value.length > MAX_POINTS) {
        historicalData.value = historicalData.value.slice(
          historicalData.value.length - MAX_POINTS
        );
      }
    }
  },
  { immediate: true },
);
```

---

## 🟢 三、测试全绿报告

### 3.1 测试执行结果

| 测试文件 | 测试用例数 | 实际结果 |
|----------|----------|---------|
| `CapacityPanel.test.ts` | 6 | ✅ 全绿 |

### 3.2 测试用例详情

| 用例编号 | 测试场景 | 预期结果 | 实际结果 | 状态 |
|----------|----------|---------|---------|------|
| TC-CP-05 | 极限数据初始化（LTTB 压测） | `data.length === 50000` | ✅ 通过 | ✅ |
| TC-CP-01 | useCapacityQuery Mock 验证 | Mock 返回正确状态 | ✅ 通过 | ✅ |
| TC-CP-06 | 数据追加逻辑 | Watch 触发数据更新 | ✅ 通过 | ✅ |
| TC-CP-08 | TrendChart 数据传递 | 接收到 50,000 条 | ✅ 通过 | ✅ |
| TC-CP-09 | 内存保护（防溢出） | 长度不超过 80,000 | ✅ 通过 | ✅ |
| TC-CP-04 | 数据格式化 | defectRate 正确格式化 | ✅ 通过 | ✅ |

---

## 🟢 四、性能优化说明

### 4.1 LTTB 降采样触发

| 配置 | 阈值 | 实际值 | 是否触发 |
|------|------|--------|---------|
| `largeThreshold` | 2000 | 50,000 | ✅ 是 |

### 4.2 内存保护策略

| 最大点数 | 截断方式 | 保留数据 |
|---------|---------|---------|
| 80,000 | `slice()` | 最新 80,000 条 |

---

## 🟢 五、V5 规约强制约束验证

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 业务逻辑无变更 | 通过 | 完全对齐蓝灯设计 |
| ✅ 响应式数据初始化 | 通过 | 50,000 条数据正确生成 |
| ✅ watch 追加逻辑 | 通过 | 新数据正确追加 |
| ✅ 内存保护实现 | 通过 | 80,000 条限制生效 |
| ✅ Lingma 注释 | 通过 | 所有关键代码均有意图注释 |
| ✅ 回归测试全绿 | 通过 | 6 个测试全部通过 |

---

> 业务代码已实现，完全对齐设计提案与测试用例，所有测试用例100%执行通过（全绿）。请确认是否进入重构阶段进行架构师级代码打磨？
