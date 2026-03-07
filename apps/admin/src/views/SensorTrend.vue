<!-- SensorTrend.vue 传感器趋势页面 -->
<!-- 阶段：🟣 重构阶段（Vue Query + 配置抽离） -->

<template>
  <div class="sensor-trend">
    <a-card title="传感器时序趋势">
      <!-- ✅ Loading 状态：直接使用 query.isLoading -->
      <a-spin :spinning="query.isLoading" tip="加载传感器数据中...">
        <!-- ✅ TrendChart 图表组件：直接传递转换后的数据 -->
        <TrendChart
          :data="chartData"
          title="传感器时序趋势"
          :color="SENSOR_COLOR"
        />
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TrendChart from './TrendChartStub.vue';
import { useSensorTrendQuery } from '@packages/shared';
import { DEFAULT_COUNT, DEFAULT_SENSOR_ID, DEFAULT_COLOR as SENSOR_COLOR } from '@/constants';
import type { ISensorTimeSeriesDataPoint } from '@packages/shared';

// 📦 查询参数（默认参数）
const queryParameters = ref({
  sensorId: DEFAULT_SENSOR_ID,
  count: DEFAULT_COUNT,
});

// 📦 Vue Query Hook
const query = useSensorTrendQuery(queryParameters);

/**
 * 📦 图表数据转换
 * @description 将 API 返回的 ISensorTimeSeriesDataPoint[] 转换为 ECharts 需要的 { time, value }[]
 */
const chartData = computed(() => {
  if (!query.data.value) return [];

  // ✅ 直接在 computed 中完成映射转换
  return query.data.value.data.map((point: ISensorTimeSeriesDataPoint) => ({
    time: point.timestamp,
    value: point.value,
  }));
});
</script>

<style scoped>
.sensor-trend {
  padding: 20px 0;
}
</style>
