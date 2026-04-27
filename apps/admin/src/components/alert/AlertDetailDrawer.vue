<!--
  告警详情抽屉
  文件职责：展示告警完整信息、处理时间轴和处理表单
-->

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAlertCenterStore } from '@/stores/alertCenter';
import { useFeedback, useAuth } from '@packages/shared';
import type { AlertProcessAction } from '@packages/shared';

const store = useAlertCenterStore();
const { toast, withLoading } = useFeedback();
const { user } = useAuth();

const processContent = ref('');
const processAction = ref<AlertProcessAction>('comment');
const submitting = ref(false);

// 当前告警
const currentAlert = computed(() => store.selectedAlert);

// 责任人名称
const assigneeName = computed(() => {
  if (!currentAlert.value?.assignedTo) return '未分配';
  const assignee = store.assignees.find((a) => a.id === currentAlert.value?.assignedTo);
  return assignee ? `${assignee.name} (${assignee.role})` : currentAlert.value.assignedTo;
});

// 严重等级颜色
function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'gold',
  };
  return colors[severity] || 'default';
}

// 状态颜色
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'red',
    acknowledged: 'orange',
    resolved: 'green',
  };
  return colors[status] || 'default';
}

// 处理进度颜色
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

// 操作类型文本
function getActionText(action: AlertProcessAction): string {
  const texts: Record<AlertProcessAction, string> = {
    assign: '分配',
    acknowledge: '确认',
    analyze: '根因分析',
    action: '处理措施',
    resolve: '解决',
    close: '关闭',
    comment: '评论',
  };
  return texts[action] || action;
}

// 操作类型颜色
function getActionColor(action: AlertProcessAction): string {
  const colors: Record<AlertProcessAction, string> = {
    assign: 'blue',
    acknowledge: 'cyan',
    analyze: 'purple',
    action: 'orange',
    resolve: 'green',
    close: 'green',
    comment: 'default',
  };
  return colors[action] || 'default';
}

// 开始处理
async function handleStartProcess() {
  if (!currentAlert.value) return;

  await withLoading(
    async () => {
      await store.updateProcess({
        alertId: currentAlert.value!.id,
        operator: user.value?.id || 'unknown',
        action: 'acknowledge',
        content: '开始处理告警',
      });
      toast.success('已开始处理');
    },
    submitting,
    '处理中...'
  );
}

// 提交处理记录
async function handleSubmitProcess() {
  if (!processContent.value.trim()) {
    toast.warning('请填写处理内容');
    return;
  }

  if (!currentAlert.value) return;

  await withLoading(
    async () => {
      await store.updateProcess({
        alertId: currentAlert.value!.id,
        operator: user.value?.id || 'unknown',
        action: processAction.value,
        content: processContent.value.trim(),
      });
      toast.success('处理记录已保存');
      processContent.value = '';
    },
    submitting,
    '保存中...'
  );
}

// 关闭抽屉
function handleClose() {
  store.closeAlertDetail();
}
</script>

<template>
  <a-drawer
    :open="store.detailDrawerOpen"
    title="告警详情"
    width="800"
    @close="handleClose"
  >
    <div v-if="currentAlert" class="alert-detail">
      <!-- 基础信息 -->
      <div class="alert-detail__section">
        <h3 class="alert-detail__section-title">基础信息</h3>
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="告警 ID" :span="2">
            {{ currentAlert.id }}
          </a-descriptions-item>
          <a-descriptions-item label="传感器">
            {{ currentAlert.sensorId }}
          </a-descriptions-item>
          <a-descriptions-item label="产线">
            {{ currentAlert.lineId }}
          </a-descriptions-item>
          <a-descriptions-item label="严重等级">
            <a-tag :color="getSeverityColor(currentAlert.severity)">
              {{ currentAlert.severity }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentAlert.status)">
              {{ currentAlert.status }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="处理进度" :span="2">
            <a-tag :color="getProcessingStatusColor(currentAlert.processingStatus)">
              {{ getProcessingStatusText(currentAlert.processingStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="标题" :span="2">
            {{ currentAlert.title }}
          </a-descriptions-item>
          <a-descriptions-item label="消息" :span="2">
            {{ currentAlert.message }}
          </a-descriptions-item>
          <a-descriptions-item label="阈值">
            {{ currentAlert.threshold }}
          </a-descriptions-item>
          <a-descriptions-item label="当前值">
            {{ currentAlert.value }}
          </a-descriptions-item>
          <a-descriptions-item label="责任人" :span="2">
            {{ assigneeName }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">
            {{ formatTime(currentAlert.timestamp) }}
          </a-descriptions-item>
          <a-descriptions-item v-if="currentAlert.mttr" label="MTTR" :span="2">
            {{ formatMttr(currentAlert.mttr) }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 处理时间轴 -->
      <div class="alert-detail__section">
        <h3 class="alert-detail__section-title">处理记录</h3>
        <a-timeline v-if="currentAlert.processRecords && currentAlert.processRecords.length > 0">
          <a-timeline-item
            v-for="record in currentAlert.processRecords"
            :key="record.id"
            :color="getActionColor(record.action)"
          >
            <div class="timeline-item">
              <div class="timeline-item__header">
                <a-tag :color="getActionColor(record.action)">
                  {{ getActionText(record.action) }}
                </a-tag>
                <span class="timeline-item__operator">
                  {{ record.operatorName || record.operator }}
                </span>
                <span class="timeline-item__time">
                  {{ formatTime(record.timestamp) }}
                </span>
              </div>
              <div class="timeline-item__content">
                {{ record.content }}
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
        <a-empty v-else description="暂无处理记录" />
      </div>

      <!-- 处理表单 -->
      <div v-if="currentAlert.status !== 'resolved'" class="alert-detail__section">
        <h3 class="alert-detail__section-title">添加处理记录</h3>

        <a-space direction="vertical" style="width: 100%">
          <a-button
            v-if="currentAlert.processingStatus === 'assigned'"
            type="primary"
            block
            @click="handleStartProcess"
          >
            开始处理
          </a-button>

          <a-form layout="vertical">
            <a-form-item label="操作类型">
              <a-select v-model:value="processAction">
                <a-select-option value="analyze">根因分析</a-select-option>
                <a-select-option value="action">处理措施</a-select-option>
                <a-select-option value="comment">评论</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="处理内容">
              <a-textarea
                v-model:value="processContent"
                placeholder="请输入处理内容"
                :rows="4"
                :maxlength="500"
                show-count
              />
            </a-form-item>

            <a-form-item>
              <a-button
                type="primary"
                block
                :loading="submitting"
                @click="handleSubmitProcess"
              >
                保存记录
              </a-button>
            </a-form-item>
          </a-form>
        </a-space>
      </div>
    </div>
  </a-drawer>
</template>

<style scoped>
.alert-detail__section {
  margin-bottom: 32px;
}

.alert-detail__section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.85);
}

.timeline-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.timeline-item__operator {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.timeline-item__time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.timeline-item__content {
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
}
</style>
