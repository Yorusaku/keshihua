<template>
  <div class="no-results">
    <EmptyState type="search" :title="title" :description="description">
      <template #action>
        <a-button v-if="showReset" @click="handleReset">清空筛选</a-button>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import EmptyState from './EmptyState.vue';

interface Props {
  title?: string;
  description?: string;
  showReset?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '暂无搜索结果',
  description: '请尝试调整搜索条件或筛选器',
  showReset: true,
});

const emit = defineEmits<{
  reset: [];
}>();

const handleReset = () => {
  emit('reset');
};
</script>

<style scoped>
.no-results {
  width: 100%;
}
</style>
