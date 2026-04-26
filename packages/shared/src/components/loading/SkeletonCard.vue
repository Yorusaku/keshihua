<template>
  <div class="skeleton-card">
    <div v-if="showHeader" class="skeleton-card__header">
      <div class="skeleton-rect skeleton-rect--title"></div>
    </div>
    <div class="skeleton-card__body">
      <div v-for="i in lines" :key="i" class="skeleton-card__line">
        <div class="skeleton-rect skeleton-rect--line"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  lines?: number;
  showHeader?: boolean;
}

withDefaults(defineProps<Props>(), {
  lines: 3,
  showHeader: true,
});
</script>

<style scoped>
.skeleton-card {
  width: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.skeleton-card__header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-card__body {
  padding: 24px;
}

.skeleton-card__line {
  margin-bottom: 16px;
}

.skeleton-card__line:last-child {
  margin-bottom: 0;
}

.skeleton-rect {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-rect--title {
  width: 150px;
  height: 22px;
}

.skeleton-rect--line {
  width: 100%;
  height: 16px;
}

.skeleton-rect--line:nth-child(3n) {
  width: 80%;
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
