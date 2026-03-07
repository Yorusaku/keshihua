/**
 * SensorTrend 传感器趋势页面（占位）
 * 文件路径：apps/admin/src/views/SensorTrend.vue
 * 阶段：🔴 红灯阶段（测试先行 - 占位文件）
 *
 * 📌 说明：
 * - 此为占位文件，实际业务逻辑未实现
 * - 红灯阶段页面抛出错误以标识测试未覆盖
 * - 所有业务逻辑将由后续实现提供
 */

<script setup lang="ts">
/**
 * 📌 占位实现
 * @description 红灯阶段：页面未就绪，抛出未实现错误
 * @throws {Error} Not implemented (Red Light)
 */
throw new Error('Not implemented (Red Light): SensorTrend page is not ready for testing');
</script>

<template>
  <div class="sensor-trend-placeholder">
    <!-- 🔴 红灯阶段：占位模板 -->
    <div class="placeholder-content">
      <h1>SensorTrend Page - Red Light Phase</h1>
      <p>Page implementation is not ready for testing</p>
      <p>Sensor time series data will be displayed here</p>
      <p>子组件：TrendChart (时序折线图)</p>
    </div>
  </div>
</template>

<style scoped>
.sensor-trend-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff3cd;
  border: 2px dashed #ffc107;
  color: #856404;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.placeholder-content {
  text-align: center;
}
</style>
