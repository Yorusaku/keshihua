<!--
  AGV 管理页
  文件职责：展示设备清单、状态过滤、分页和最小新增能力。
-->

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { IAgvData } from '@packages/shared';
import { ensureSharedProvider } from '@/composables';

interface AgvQueryForm {
  keyword: string;
  status?: IAgvData['status'];
}

const route = useRoute();
const loading = ref(false);
const sourceLabel = ref('--');
const tableData = ref<IAgvData[]>([]);
const total = ref(0);
const current = ref(1);
const pageSize = ref(10);

const queryForm = reactive<AgvQueryForm>({
  keyword: '',
  status: undefined,
});

const contextHint = computed(() => {
  const keys = ['lineId', 'agvId', 'alertId'] as const;
  const parts = [];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = route.query[key];
    if (typeof value === 'string' && value) {
      parts.push(`${key}: ${value}`);
    }
  }
  return parts.length ? parts.join(' · ') : '无上下文筛选';
});

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const provider = await ensureSharedProvider('auto');
    sourceLabel.value = provider.runtimeStatus.sourceLabel;
    const response = await provider.getAgvList({
      current: current.value,
      pageSize: pageSize.value,
      keyword: queryForm.keyword.trim() || undefined,
      status: queryForm.status,
    });
    tableData.value = response.list;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

async function handleSearch(): Promise<void> {
  current.value = 1;
  await fetchList();
}

async function handleReset(): Promise<void> {
  queryForm.keyword = '';
  queryForm.status = undefined;
  current.value = 1;
  await fetchList();
}

async function handlePageChange(page: number, size: number): Promise<void> {
  current.value = page;
  pageSize.value = size;
  await fetchList();
}

async function handleAddMockAgv(): Promise<void> {
  const provider = await ensureSharedProvider('auto');
  const nextId = `AGV-${String(Date.now()).slice(-4)}`;
  await provider.addAgv({
    id: nextId,
    x: 200 + Math.random() * 800,
    y: 120 + Math.random() * 600,
    status: 'idle',
  });
  await fetchList();
}

function statusColor(status: IAgvData['status']): string {
  if (status === 'error') return 'error';
  if (status === 'moving') return 'processing';
  return 'default';
}

onMounted(async () => {
  if (typeof route.query.agvId === 'string') {
    queryForm.keyword = route.query.agvId;
  }
  await fetchList();
});
</script>

<template>
  <a-card class="agv-page" title="AGV 设备管理">
    <template #extra>
      <span class="agv-page__extra">数据源：{{ sourceLabel }}</span>
    </template>

    <p class="agv-page__context">{{ contextHint }}</p>

    <div class="agv-page__toolbar">
      <a-input
        v-model:value="queryForm.keyword"
        allow-clear
        placeholder="按车辆 ID 搜索"
        style="width: 220px"
      />
      <a-select
        v-model:value="queryForm.status"
        allow-clear
        placeholder="状态筛选"
        style="width: 160px"
      >
        <a-select-option value="idle">空闲</a-select-option>
        <a-select-option value="moving">运行中</a-select-option>
        <a-select-option value="error">故障</a-select-option>
      </a-select>

      <a-button type="primary" :loading="loading" @click="handleSearch">查询</a-button>
      <a-button :disabled="loading" @click="handleReset">重置</a-button>
      <a-button :disabled="loading" @click="handleAddMockAgv">新增模拟车辆</a-button>
    </div>

    <a-table
      row-key="id"
      :data-source="tableData"
      :loading="loading"
      :pagination="{
        current,
        pageSize,
        total,
        showSizeChanger: true,
        onChange: handlePageChange,
      }"
    >
      <a-table-column title="车辆 ID" data-index="id" key="id" />
      <a-table-column title="X 坐标" data-index="x" key="x" />
      <a-table-column title="Y 坐标" data-index="y" key="y" />
      <a-table-column title="状态" key="status">
        <template #default="{ record }">
          <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="时间戳" key="timestamp">
        <template #default="{ record }">
          {{ new Date(record.timestamp).toLocaleString('zh-CN') }}
        </template>
      </a-table-column>
    </a-table>
  </a-card>
</template>

<style scoped>
.agv-page__extra {
  color: #3f637f;
}

.agv-page__context {
  margin: 0 0 12px;
  color: #5f7f99;
}

.agv-page__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
</style>
