<!-- AgvList.vue AGV 车辆管理 -->
<!-- 阶段：🟣 纠偏阶段（Ant Design Vue） -->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DataBuffer } from '@packages/shared';
import type { IAgvData } from '@packages/shared';

const loading = ref(false);
const agvList = ref<IAgvData[]>([]);

// ✅ Ant Design Vue 标准的列配置
const columns = [
  { title: '车辆 ID', dataIndex: 'id', key: 'id' },
  { title: 'X 坐标', dataIndex: 'x', key: 'x' },
  { title: 'Y 坐标', dataIndex: 'y', key: 'y' },
  { title: '当前状态', dataIndex: 'status', key: 'status' },
];

const getStatusType = (status: string) => {
  const map: Record<string, string> = { idle: 'success', moving: 'processing', error: 'error' };
  return map[status] || 'default';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = { idle: '空闲', moving: '移动中', error: '错误' };
  return map[status] || status;
};

onMounted(() => {
  loading.value = true;
  try {
    const buffer = DataBuffer.getInstance();
    console.log('📊 Initial snapshot length:', buffer.getSnapshot().length);
    
    // ✅ 修复 Qwen 的遗漏：如果缓冲池没数据，手动塞入 5 条 Mock 数据
    if (buffer.getSnapshot().length === 0) {
      console.log('⚠️ Buffer empty, injecting Mock data...');
      buffer.pushData([
        { id: 'AGV-001', x: 120.5, y: 340.2, status: 'idle', timestamp: Date.now() },
        { id: 'AGV-002', x: 800.1, y: 150.8, status: 'moving', timestamp: Date.now() },
        { id: 'AGV-003', x: 450.0, y: 900.0, status: 'error', timestamp: Date.now() },
        { id: 'AGV-004', x: 320.4, y: 110.2, status: 'moving', timestamp: Date.now() },
        { id: 'AGV-005', x: 90.0, y: 80.0, status: 'idle', timestamp: Date.now() },
      ]);
      console.log('✅ Mock data injected, new snapshot length:', buffer.getSnapshot().length);
    }
    agvList.value = buffer.getSnapshot();
    console.log('✅ Final agvList:', agvList.value);
  } catch (error) {
    console.error('❌ Failed to fetch AGV data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="agv-list">
    <a-card title="AGV 车辆管理">
      <a-table 
        :dataSource="agvList" 
        :columns="columns" 
        :loading="loading"
        rowKey="id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusType(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.agv-list {
  padding: 20px 0;
}
</style>
