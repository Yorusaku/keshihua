<template>
  <div class="skeleton-table">
    <div class="skeleton-table__toolbar">
      <div class="skeleton-rect skeleton-rect--button"></div>
      <div class="skeleton-rect skeleton-rect--button"></div>
      <div class="skeleton-rect skeleton-rect--search"></div>
    </div>
    <div class="skeleton-table__header">
      <div v-for="i in columns" :key="i" class="skeleton-table__header-cell">
        <div class="skeleton-rect skeleton-rect--text"></div>
      </div>
    </div>
    <div class="skeleton-table__body">
      <div v-for="i in rows" :key="i" class="skeleton-table__row">
        <div v-for="j in columns" :key="j" class="skeleton-table__cell">
          <div class="skeleton-rect skeleton-rect--text"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rows?: number;
  columns?: number;
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 5,
});
</script>

<style scoped>
.skeleton-table {
  width: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
}

.skeleton-table__toolbar {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-table__header {
  display: flex;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-table__header-cell {
  flex: 1;
  padding: 0 8px;
}

.skeleton-table__body {
  padding: 0;
}

.skeleton-table__row {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-table__row:last-child {
  border-bottom: none;
}

.skeleton-table__cell {
  flex: 1;
  padding: 0 8px;
}

.skeleton-rect {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-rect--button {
  width: 80px;
  height: 32px;
}

.skeleton-rect--search {
  width: 200px;
  height: 32px;
  margin-left: auto;
}

.skeleton-rect--text {
  width: 100%;
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
