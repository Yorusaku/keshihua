<!-- SensorTrend.vue 传感器趋势页面 -->
<!-- 阶段：🟢 绿灯阶段（业务实现） -->

<template>
  <div class="sensor-trend">
    <a-card title="传感器时序趋势">
      <!-- ✅ Loading 状态 -->
      <a-spin :spinning="isLoading" tip="加载传感器数据中...">
        <!-- ✅ TrendChart 图表组件 -->
        <TrendChart :data="chartData" title="传感器时序趋势" color="#3B82F6" />
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TrendChart from '@packages/charts/src/echarts/TrendChart.vue';
import { fetchSensorTimeSeries } from '@packages/shared';

// 📦 Loading 状态
const isLoading = ref(true);

// 📦 图表数据
const chartData = ref<Array<{ time: number; value: number }>>([]);

/**
 * 🚀 onMounted：加载传感器时序数据
 */
onMounted(async () => {
  try {
    // ✅ 调用 API 获取十万级数据
    const response = await fetchSensorTimeSeries({ count: 100000 });

    // ✅ 数据转换：ISensorTimeSeriesDataPoint[] => { time, value }[]
    chartData.value = response.data.map((point) => ({
      time: point.timestamp,
      value: point.value,
    }));

    // ✅ 隐藏 Loading 状态
    isLoading.value = false;
  } catch (error) {
    console.error('SensorTrend: 加载数据失败', error);
    isLoading.value = false;
  }
});
</script>

<style scoped>
.sensor-trend {
  padding: 20px 0;
}
</style>
