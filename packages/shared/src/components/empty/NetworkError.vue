<template>
  <div class="network-error">
    <EmptyState type="error" :title="title" :description="description">
      <template #action>
        <a-button type="primary" :loading="retrying" @click="handleRetry">
          {{ retrying ? '重试中...' : '重试' }}
        </a-button>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EmptyState from './EmptyState.vue';

interface Props {
  title?: string;
  description?: string;
}

withDefaults(defineProps<Props>(), {
  title: '网络请求失败',
  description: '请检查网络连接后重试',
});

const emit = defineEmits<{
  retry: [];
}>();

const retrying = ref(false);

const handleRetry = async () => {
  retrying.value = true;
  try {
    emit('retry');
  } finally {
    setTimeout(() => {
      retrying.value = false;
    }, 500);
  }
};
</script>

<style scoped>
.network-error {
  width: 100%;
}
</style>
