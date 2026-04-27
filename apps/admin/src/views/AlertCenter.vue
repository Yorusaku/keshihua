<!--
  告警处理中心
  文件职责：提供告警查询、分配、处理和统计功能
-->

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useAlertCenterStore } from '@/stores/alertCenter';
import type { SensorAlertItem } from '@packages/shared';
import { ensureSharedProvider } from '@/composables';
import AssignAlertModal from '@/components/alert/AssignAlertModal.vue';
import CloseAlertModal from '@/components/alert/CloseAlertModal.vue';
import AlertDetailDrawer from '@/components/alert/AlertDetailDrawer.vue';

const store = useAlertCenterStore();
const initializing = ref(true);
const closeModalRef = ref<InstanceType<typeof CloseAlertModal>>();

// 统计卡片数据
const statsCards = computed(() => [
  {
    title: '总告警数',
    value: store.statistics?.totalCount || 0,
    suffix: '条',
    color: '#1890ff',
  },
  {
    title: '活跃告警',
    value: store.statistics?.activeCount || 0,
    suffix: '条',
    color: '#ff4d4f',
  },
  {
    title: '平均 MTTR',
    value: store.statistics?.avgMttr || 0,
    suffix: '分钟',
    color: '#52c41a',
  },
  {
    title: '已解决',
    value: store.statistics?.resolvedCount || 0,
    suffix: '条',
    color: '#faad14',
  },
]);

// 严重等级选项
const severityOptions = [
  { label: '严重', value: 'critical' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
];

// 状态选项
const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '已确认', value: 'acknowledged' },
  { label: '已解决', value: 'resolved' },
];

// 处理进度选项
const processingStatusOptions = [
  { label: '未分配', value: 'unassigned' },
  { label: '已分配', value: 'assigned' },
  { label: '处理中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
];

// 表格列定义
const columns = [
  { title: '告警 ID', dataIndex: 'id', key: 'id', width: 180 },
  { title: '传感器', dataIndex: 'sensorId', key: 'sensorId', width: 150 },
  { title: '产线', dataIndex: 'lineId', key: 'lineId', width: 100 },
  { title: '严重等级', dataIndex: 'severity', key: 'severity', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '处理进度', dataIndex: 'processingStatus', key: 'processingStatus', width: 120 },
  { title: '责任人', dataIndex: 'assignedTo', key: 'assignedTo', width: 120 },
  { title: '创建时间', dataIndex: 'timestamp', key: 'timestamp', width: 180 },
  { title: 'MTTR', dataIndex: 'mttr', key: 'mttr', width: 100 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' },
];

// 严重等级标签颜色
function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'gold',
  };
  return colors[severity] || 'default';
}

// 状态标签颜色
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'red',
    acknowledged: 'orange',
    resolved: 'green',
  };
  return colors[status] || 'default';
}

// 处理进度标签颜色
function getProcessingStatusColor(status?: string): string {
  const colors: Record<string, string> = {
    unassigned: 'default',
    assigned: 'blue',
    in_progress: 'orange',
    completed: 'green',
  };
  return colors[status || 'unassigned'] || 'default';
}

// 处理进度文本
function getProcessingStatusText(status?: string): string {
  const texts: Record<string, string> = {
    unassigned: '未分配',
    assigned: '已分配',
    in_progress: '处理中',
    completed: '已完成',
  };
  return texts[status || 'unassigned'] || '未分配';
}

// 格式化时间
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

// 格式化 MTTR
function formatMttr(mttr?: number): string {
  if (!mttr) return '-';
  const minutes = Math.round(mttr / 60000);
  return `${minutes} 分钟`;
}

// 获取责任人名称
function getAssigneeName(assignedTo?: string): string {
  if (!assignedTo) return '-';
  const assignee = store.assignees.find((a) => a.id === assignedTo);
  return assignee?.name || assignedTo;
}

// 查询
function handleSearch() {
  store.updateQueryParams({ current: 1 });
  void store.fetchAlerts();
}

// 重置
function handleReset() {
  store.resetQueryParams();
  void store.fetchAlerts();
}

// 分页变化
function handlePageChange(page: number, pageSize: number) {
  store.updateQueryParams({ current: page, pageSize });
  void store.fetchAlerts();
}

// 查看详情
function handleViewDetail(record: SensorAlertItem) {
  store.openAlertDetail(record.id);
}

// 分配告警
function handleAssign(record: SensorAlertItem) {
  store.openAssignModal(record.id);
}

// 关闭告警
function handleClose(record: SensorAlertItem) {
  closeModalRef.value?.open(record.id);
}

// 初始化
onMounted(async () => {
  try {
    await ensureSharedProvider();
    await Promise.all([
      store.fetchAlerts(),
      store.fetchStatistics(),
      store.fetchAssignees(),
    ]);
  } finally {
    initializing.value = false;
  }

  // 订阅跨端同步事件
  const unsubscribe = store.subscribeAlertEvents();
  onUnmounted(unsubscribe);
});
</script>

<template>
  <div class="alert-center">
    <!-- 统计卡片 -->
    <div class="alert-center__stats">
      <a-card
        v-for="card in statsCards"
        :key="card.title"
        class="alert-center__stat-card"
        :bordered="false"
      >
        <div class="stat-card__content">
          <div class="stat-card__title">{{ card.title }}</div>
          <div class="stat-card__value" :style="{ color: card.color }">
            {{ card.value }}
            <span class="stat-card__suffix">{{ card.suffix }}</span>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 筛选条件 -->
    <a-card class="alert-center__filter" :bordered="false">
      <a-form layout="inline">
        <a-form-item label="产线">
          <a-select
            v-model:value="store.queryParams.lineId"
            placeholder="全部产线"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="line-a">A 产线</a-select-option>
            <a-select-option value="line-b">B 产线</a-select-option>
            <a-select-option value="line-c">C 产线</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="严重等级">
          <a-select
            v-model:value="store.queryParams.severity"
            placeholder="全部等级"
            style="width: 150px"
            allow-clear
          >
            <a-select-option
              v-for="opt in severityOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="状态">
          <a-select
            v-model:value="store.queryParams.status"
            placeholder="全部状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="处理进度">
          <a-select
            v-model:value="store.queryParams.processingStatus"
            placeholder="全部进度"
            style="width: 150px"
            allow-clear
          >
            <a-select-option
              v-for="opt in processingStatusOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="关键词">
          <a-input
            v-model:value="store.queryParams.keyword"
            placeholder="告警ID/传感器ID"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 告警列表 -->
    <a-card class="alert-center__table" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="store.alerts"
        :loading="store.loading"
        :pagination="{
          current: store.queryParams.current,
          pageSize: store.queryParams.pageSize,
          total: store.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number) => `共 ${total} 条`,
        }"
        :scroll="{ x: 1500 }"
        @change="(pagination: any) => handlePageChange(pagination.current, pagination.pageSize)"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'severity'">
            <a-tag :color="getSeverityColor(record.severity)">
              {{ record.severity }}
            </a-tag>
          </template>

          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>

          <template v-if="column.key === 'processingStatus'">
            <a-tag :color="getProcessingStatusColor(record.processingStatus)">
              {{ getProcessingStatusText(record.processingStatus) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'assignedTo'">
            {{ getAssigneeName(record.assignedTo) }}
          </template>

          <template v-if="column.key === 'timestamp'">
            {{ formatTime(record.timestamp) }}
          </template>

          <template v-if="column.key === 'mttr'">
            {{ formatMttr(record.mttr) }}
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleViewDetail(record)">
                详情
              </a-button>
              <a-button
                type="link"
                size="small"
                :disabled="record.status === 'resolved'"
                @click="handleAssign(record)"
              >
                分配
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                :disabled="record.status === 'resolved'"
                @click="handleClose(record)"
              >
                关闭
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 分配告警对话框 -->
    <AssignAlertModal />

    <!-- 关闭告警对话框 -->
    <CloseAlertModal ref="closeModalRef" />

    <!-- 告警详情抽屉 -->
    <AlertDetailDrawer />
  </div>
</template>

<style scoped>
.alert-center {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.alert-center__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.alert-center__stat-card {
  background: #fff;
}

.stat-card__content {
  text-align: center;
}

.stat-card__title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 8px;
}

.stat-card__value {
  font-size: 30px;
  font-weight: 600;
  line-height: 38px;
}

.stat-card__suffix {
  font-size: 16px;
  font-weight: 400;
  margin-left: 4px;
}

.alert-center__filter {
  margin-bottom: 16px;
}

.alert-center__table {
  background: #fff;
}
</style>
