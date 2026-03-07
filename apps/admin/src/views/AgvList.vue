<!-- AgvList.vue AGV 车辆管理 -->
<!-- 阶段：🟣 纠偏阶段（Ant Design Vue） -->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DataBuffer } from '@packages/shared';
import type { IAgvData } from '@packages/shared';
import { LoadingOutlined } from '@ant-design/icons-vue';

const loading = ref(false);
const agvList = ref<IAgvData[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    // 从 DataBuffer 获取 AGV 数据快照
    const snapshot = DataBuffer.getInstance().getSnapshot();
    agvList.value = snapshot;
  } catch (error) {
    console.error('Failed to fetch AGV data:', error);
  } finally {
    loading.value = false;
  }
});

/**
 * 📌 表格列配置
 */
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 100,
  },
  {
    title: 'X 坐标',
    dataIndex: 'x',
    width: 120,
  },
  {
    title: 'Y 坐标',
    dataIndex: 'y',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
  },
];

/**
 * 📌 行渲染函数
 */
const rowKey = (record: IAgvData) => record.id;
</script>

<template>
  <div class="agv-list">
    <a-card>
      <template #title>AGV 车辆管理</template>

      <a-table
        v-loading:loading="loading"
        :data-source="agvList"
        :columns="columns"
        :row-key="rowKey"
        :pagination="false"
        :scroll="{ x: 'max-content' }"
        size="middle"
      />
    </a-card>
  </div>
</template>

<style scoped>
.agv-list {
  padding: 20px 0;
}
</style>
