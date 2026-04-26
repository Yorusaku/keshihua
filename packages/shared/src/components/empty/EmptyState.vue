<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <svg
        v-if="type === 'empty'"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="8" y="8" width="48" height="48" rx="4" stroke="#d9d9d9" stroke-width="2" fill="none" />
        <line x1="16" y1="24" x2="48" y2="24" stroke="#d9d9d9" stroke-width="2" />
        <line x1="16" y1="32" x2="40" y2="32" stroke="#d9d9d9" stroke-width="2" />
        <line x1="16" y1="40" x2="44" y2="40" stroke="#d9d9d9" stroke-width="2" />
      </svg>
      <svg
        v-else-if="type === 'search'"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="28" cy="28" r="16" stroke="#d9d9d9" stroke-width="2" fill="none" />
        <line x1="40" y1="40" x2="52" y2="52" stroke="#d9d9d9" stroke-width="2" stroke-linecap="round" />
        <line x1="28" y1="20" x2="28" y2="36" stroke="#d9d9d9" stroke-width="2" />
        <line x1="20" y1="28" x2="36" y2="28" stroke="#d9d9d9" stroke-width="2" />
      </svg>
      <svg
        v-else
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="32" r="24" stroke="#d9d9d9" stroke-width="2" fill="none" />
        <path d="M32 20 L32 36" stroke="#d9d9d9" stroke-width="2" stroke-linecap="round" />
        <circle cx="32" cy="44" r="2" fill="#d9d9d9" />
      </svg>
    </div>
    <div class="empty-state__title">{{ title }}</div>
    <div v-if="description" class="empty-state__description">{{ description }}</div>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'empty' | 'search' | 'error';
  title: string;
  description?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'empty',
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state__icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state__title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 8px;
}

.empty-state__description {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 16px;
  max-width: 400px;
}

.empty-state__action {
  margin-top: 8px;
}
</style>
