<!-- AgvList.vue AGV 车辆管理 -->
<!-- 阶段：🟢 绿灯阶段（完整实现） -->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DataBuffer } from '@packages/shared';
import type { IAgvData } from '@packages/shared';

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
</script>

<template>
  <div class="agv-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AGV 车辆管理</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="agvList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="x" label="X 坐标" width="100" />
        <el-table-column prop="y" label="Y 坐标" width="100" />
        <el-table-column prop="status" label="状态" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
// 状态映射（仅保留，不使用）
const AGV_STATUS_MAP = {
  idle: { text: '空闲', type: 'success' },
  moving: { text: '移动中', type: 'primary' },
  error: { text: '错误', type: 'danger' },
};
</script>

<style scoped>
.agv-list {
  padding: 20px 0;
}
</style>
