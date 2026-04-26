<template>
  <div v-if="selectedCount > 0" class="bulk-actions">
    <div class="bulk-actions__info">
      <a-checkbox
        :checked="selectedCount > 0"
        :indeterminate="selectedCount > 0 && selectedCount < total"
        @change="handleSelectAll"
      />
      <span class="bulk-actions__text">已选择 {{ selectedCount }} 项</span>
    </div>
    <div class="bulk-actions__buttons">
      <slot name="actions">
        <a-button danger size="small" @click="handleDelete">
          批量删除
        </a-button>
      </slot>
      <a-button size="small" @click="handleClear">
        取消选择
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedCount: number;
  total: number;
}

defineProps<Props>();

const emit = defineEmits<{
  selectAll: [];
  clear: [];
  delete: [];
}>();

const handleSelectAll = () => {
  emit('selectAll');
};

const handleClear = () => {
  emit('clear');
};

const handleDelete = () => {
  emit('delete');
};
</script>

<style scoped>
.bulk-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  margin-bottom: 12px;
}

.bulk-actions__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bulk-actions__text {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.bulk-actions__buttons {
  display: flex;
  gap: 8px;
}
</style>
