<template>
  <a-button :loading="exporting" @click="handleExport">
    <template #icon>
      <DownloadOutlined />
    </template>
    {{ exporting ? '导出中...' : '导出 CSV' }}
  </a-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DownloadOutlined } from '@ant-design/icons-vue';

interface Props {
  data: any[];
  columns: Array<{ title: string; dataIndex: string }>;
  filename?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filename: 'export',
});

const emit = defineEmits<{
  export: [];
}>();

const exporting = ref(false);

const handleExport = async () => {
  exporting.value = true;
  emit('export');

  try {
    // 构建 CSV 内容
    const headers = props.columns.map(col => col.title).join(',');
    const rows = props.data.map(row => {
      return props.columns.map(col => {
        const value = row[col.dataIndex];
        // 处理包含逗号或换行的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');

    // 添加 BOM 以支持中文
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${props.filename}_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } finally {
    setTimeout(() => {
      exporting.value = false;
    }, 500);
  }
};
</script>
