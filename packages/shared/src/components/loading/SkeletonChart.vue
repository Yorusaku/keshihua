<template>
  <div class="skeleton-chart">
    <div class="skeleton-chart__header">
      <div class="skeleton-rect skeleton-rect--title"></div>
      <div class="skeleton-rect skeleton-rect--legend"></div>
    </div>
    <div class="skeleton-chart__body">
      <div class="skeleton-chart__bars">
        <div
          v-for="i in bars"
          :key="i"
          class="skeleton-chart__bar"
          :style="{ height: `${Math.random() * 60 + 20}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  bars?: number;
}

withDefaults(defineProps<Props>(), {
  bars: 12,
});
</script>

<style scoped>
.skeleton-chart {
  width: 100%;
  height: 300px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  padding: 16px;
}

.skeleton-chart__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.skeleton-chart__body {
  height: calc(100% - 60px);
  display: flex;
  align-items: flex-end;
}

.skeleton-chart__bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 8px;
}

.skeleton-chart__bar {
  flex: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px 4px 0 0;
  min-height: 20%;
}

.skeleton-rect {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-rect--title {
  width: 120px;
  height: 20px;
}

.skeleton-rect--legend {
  width: 200px;
  height: 16px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
