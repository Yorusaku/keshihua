<!--
  关闭告警对话框
  文件职责：提供告警关闭功能，填写处理结果、根因分析和处理措施
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAlertCenterStore } from '@/stores/alertCenter';
import { useFeedback, useAuth } from '@packages/shared';

const store = useAlertCenterStore();
const { toast, withLoading } = useFeedback();
const { user } = useAuth();

const visible = ref(false);
const selectedAlertId = ref<string | null>(null);
const resolution = ref('');
const rootCause = ref('');
const actionTaken = ref('');
const submitting = ref(false);

// 当前选中的告警
const currentAlert = computed(() => {
  if (!selectedAlertId.value) return null;
  return store.alerts.find((a) => a.id === selectedAlertId.value) || null;
});

// 打开对话框
function open(alertId: string) {
  selectedAlertId.value = alertId;
  visible.value = true;
  resetForm();
}

// 重置表单
function resetForm() {
  resolution.value = '';
  rootCause.value = '';
  actionTaken.value = '';
}

// 监听对话框关闭
watch(visible, (open) => {
  if (!open) {
    selectedAlertId.value = null;
  }
});

// 提交关闭
async function handleSubmit() {
  if (!resolution.value.trim()) {
    toast.warning('请填写处理结果');
    return;
  }

  if (!currentAlert.value) {
    toast.error('未找到告警信息');
    return;
  }

  await withLoading(
    async () => {
      await store.closeAlert({
        alertId: currentAlert.value!.id,
        operator: user.value?.id || 'unknown',
        resolution: resolution.value.trim(),
        rootCause: rootCause.value.trim() || undefined,
        actionTaken: actionTaken.value.trim() || undefined,
      });

      toast.success('告警已关闭');
      visible.value = false;
      await store.fetchAlerts();
      await store.fetchStatistics();
    },
    submitting,
    '关闭中...'
  );
}

// 取消
function handleCancel() {
  visible.value = false;
}

// 暴露方法给父组件
defineExpose({
  open,
});
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="关闭告警"
    width="600px"
    :confirm-loading="submitting"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <div v-if="currentAlert" class="close-modal">
      <!-- 告警信息 -->
      <div class="close-modal__alert-info">
        <a-alert
          :message="`${currentAlert.sensorId} - ${currentAlert.title}`"
          :description="currentAlert.message"
          type="warning"
          show-icon
        />
      </div>

      <!-- 关闭表单 -->
      <div class="close-modal__form">
        <a-form layout="vertical">
          <a-form-item label="处理结果" required>
            <a-textarea
              v-model:value="resolution"
              placeholder="请描述告警的处理结果（必填）"
              :rows="3"
              :maxlength="500"
              show-count
            />
          </a-form-item>

          <a-form-item label="根因分析">
            <a-textarea
              v-model:value="rootCause"
              placeholder="可选填写根因分析"
              :rows="3"
              :maxlength="500"
              show-count
            />
          </a-form-item>

          <a-form-item label="处理措施">
            <a-textarea
              v-model:value="actionTaken"
              placeholder="可选填写采取的处理措施"
              :rows="3"
              :maxlength="500"
              show-count
            />
          </a-form-item>
        </a-form>
      </div>

      <!-- 提示信息 -->
      <a-alert
        message="关闭后告警状态将变为"已解决"，系统将自动计算 MTTR"
        type="info"
        show-icon
      />
    </div>
  </a-modal>
</template>

<style scoped>
.close-modal__alert-info {
  margin-bottom: 24px;
}

.close-modal__form {
  margin-bottom: 16px;
}
</style>
