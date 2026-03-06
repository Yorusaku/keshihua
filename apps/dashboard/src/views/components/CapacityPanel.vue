/**
 * CapacityPanel.vue 宏观产能 HUD 面板组件
 * 文件路径：apps/dashboard/src/views/components/CapacityPanel.vue
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 重构说明：
 * - 抽离 useCapacityHistoricalData Composable，处理历史数据逻辑
 * - 组件回归"只负责展示"的本职工作（纯 UI 层）
 * - 保持业务逻辑完全不变（测试 6 个全部通过）
 *
 * 📌 功能说明：
 * - 悬浮在AGV Canvas 之上的工业科幻 HUD 面板
 * - 显示 total（总数）、completed（完成数）、defectRate（不良率）三个核心指标
 * - 集成 TrendChart 显示 50,000+ 条历史产能时序趋势
 * - 极限压测：LTTB 降采样算法优化大数据渲染性能
 *
 * 🚀 性能优化：
 * - 初始化 50,000 条历史数据（触发 ECharts LTTB 降采样）
 * - watch 监听 useCapacityQuery 数据变化，追加新数据
 * - 80,000 条内存保护：超过限制时截断旧数据（防止内存溢出）
 */

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useCapacityQuery } from '@packages/shared';
import { TrendChart } from '@packages/charts';
import { useCapacityHistoricalData } from './utils/useCapacityHistoricalData';
import type { CapacityData } from '@packages/shared';

/**
 * 📦 useCapacityQuery 查询结果
 * @description 调用网络层，启动 30 秒静默轮询
 */
const queryResult = useCapacityQuery();

/**
 * 📦 是否正在加载
 * @description Vue Query 的 isLoading 是 Ref<boolean>，但在 v-if 中需要手动解包
 */
const isLoading = ref(false);

/**
 * 📦 是否出错
 * @description Vue Query 的 isError 是 Ref<boolean>，需要手动解包
 */
const isError = ref(false);

/**
 * 📦 调试：打印 queryResult 状态
 */
onMounted(() => {
  console.log('[CapacityPanel Debug] queryResult:', {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
  });

  // ✅ 监听isLoading变化
  watch(queryResult.isLoading, (newLoading) => {
    isLoading.value = newLoading;
    console.log('[CapacityPanel Debug] isLoading changed:', newLoading);
  });

  // ✅ 监听isError变化
  watch(queryResult.isError, (newError) => {
    isError.value = newError;
    console.log('[CapacityPanel Debug] isError changed:', newError);
  });

  // ✅ 监听数据变化
  watch(
    () => queryResult.data.value,
    (newData) => {
      console.log('[CapacityPanel Debug] data changed:', newData);
    }
  );
});

/**
 * 📦 useCapacityHistoricalData Composable
 * @description 封装历史数据初始化、watch 追加、防内存溢出逻辑
 */
const { historicalData, formatDefectRate } = useCapacityHistoricalData(queryResult.data);

/**
 * 📦 调试：打印 historicalData
 */
onMounted(() => {
  console.log('[CapacityPanel Debug] historicalData:', historicalData);
  console.log('[CapacityPanel Debug] historicalData length:', historicalData.value.length);
  if (historicalData.value.length > 0) {
    console.log('[CapacityPanel Debug] historicalData first item:', historicalData.value[0]);
    console.log('[CapacityPanel Debug] historicalData last item:', historicalData.value[historicalData.value.length - 1]);
  }
});

/**
 * 📦 响应式引用：最新产能数据（用于 UI 渲染）
 */
const capacity = ref<CapacityData | undefined>(queryResult.data.value);

/**
 * 📦 监听 queryResult.data 变化，更新 capacity
 */
watch(
  () => queryResult.data.value,
  (newData) => {
    if (newData) {
      capacity.value = newData;
    }
  },
  { immediate: true }
);
</script>

<template>
  <!-- ✅ CapacityPanel 容器（绝对定位悬浮，左上角） -->
  <div class="capacity-panel">
    <!-- Loading 态：数据加载中 -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span class="label">数据加载中...</span>
    </div>

    <!-- Error 态：数据加载失败 -->
    <div v-else-if="isError" class="error-state">
      <div class="error-icon">❌</div>
      <span class="label">数据加载失败，请检查网络</span>
    </div>

    <!-- Success 态：正常显示数据 -->
    <div v-else class="success-state">
      <!-- 上半部分：数字指标区（Metrics Dashboard） -->
      <div class="metrics-container">
        <!-- 总产能指标卡片 -->
        <div class="metric-card">
          <div class="metric-icon">🏭</div>
          <div class="metric-label">总产能</div>
          <div class="metric-value">{{ capacity?.total }}</div>
          <div class="metric-unit">台</div>
        </div>

        <!-- 已完成数量指标卡片 -->
        <div class="metric-card">
          <div class="metric-icon">✅</div>
          <div class="metric-label">已完成</div>
          <div class="metric-value">{{ capacity?.completed }}</div>
          <div class="metric-unit">台</div>
        </div>

        <!-- 不良率指标卡片 -->
        <div class="metric-card">
          <div class="metric-icon">⚠️</div>
          <div class="metric-label">不良率</div>
          <div class="metric-value">{{ formatDefectRate(capacity?.defectRate) }}</div>
          <div class="metric-unit">%</div>
        </div>
      </div>

      <!-- 下半部分：时序折线图区（TrendChart） -->
      <div class="chart-container">
        <TrendChart
          :data="historicalData"
          title="产能趋势"
          color="#3B82F6"
          :line-width="2"
          :show-area="true"
          :tooltip-enabled="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ CapacityPanel 样式（HUD 风格） */

.capacity-panel {
  /* 🔥 绝对定位：悬浮在 AGV Canvas 之上 */
  position: absolute;
  top: 20px;
  left: 20px;
  width: 400px;
  height: 500px;
  z-index: 10; /* 🔥 z-index: 10 - 确保在 AGV Canvas 之上 */

  /* 半透明深色背景 + 科技感边框 */
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);

  /* Flex 布局：上半部分指标 + 下半部分图表 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ✅ Loading 态样式 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* ✅ Error 态样式 */
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
}

.error-icon {
  font-size: 24px;
}

/* ✅ Success 态：指标容器 */
.metrics-container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  gap: 10px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6));
}

/* ✅ 指标卡片样式 */
.metric-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px 10px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.metric-card:hover {
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

/* ✅ 指标图标 */
.metric-icon {
  font-size: 20px;
  margin-bottom: 8px;
}

/* ✅ 指标标签 */
.metric-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

/* ✅ 指标数值（霓虹发光字体） */
.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
  margin-bottom: 4px;
}

/* ✅ 指标单位 */
.metric-unit {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

/* ✅ 图表容器 */
.chart-container {
  flex: 1;
  position: relative;
  padding: 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  border-top: 1px solid rgba(59, 130, 246, 0.3);
}

/* ✅ 动画：Spinner 旋转 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
