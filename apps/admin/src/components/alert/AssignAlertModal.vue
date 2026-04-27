<!--
  分配告警对话框
  文件职责：提供告警分配功能，选择责任人并添加备注
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAlertCenterStore } from '@/stores/alertCenter';
import { useFeedback, useAuth } from '@packages/shared';

const store = useAlertCenterStore();
const { toast, withLoading } = useFeedback();
const { user } = useAuth();

const assignedTo = ref<string | undefined>(undefined);
const note = ref('');
const submitting = ref(false);

// 当前选中的告警
const currentAlert = computed(() => store.selectedAlert);

// 责任人选项
const assigneeOptions = computed(() =>
  store.assignees.map((a) => ({
    label: `${a.name} - ${a.role}`,
    value: a.id,
  }))
);

// 重置表单
function resetForm() {
  assignedTo.value = undefined;
  note.value = '';
}

// 监听对话框打开，重置表单
watch(
  () => store.assignModalOpen,
  (open) => {
    if (open) {
      resetForm();
    }
  }
);

// 提交分配
async function handleSubmit() {
  if (!assignedTo.value) {
    toast.warning('请选择责任人');
    return;
  }

  if (!currentAlert.value) {
    toast.error('未找到告警信息');
    return;
  }

  await withLoading(
    async () => {
      await store.assignAlert({
        alertId: currentAlert.value!.id,
        assignedTo: assignedTo.value!,
        assignedBy: user.value?.id || 'unknown',
        note: note.value || undefined,
      });

      toast.success('分配成功');
      store.closeAssignModal();
      await store.fetchAlerts();
    },
    submitting,
    '分配中...'
  );
}

// 取消
function handleCancel() {
  store.closeAssignModal();
}
</script>

<template>
  <a-modal
    :open="store.assignModalOpen"
    title="分配告警"
    :confirm-loading="submitting"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <div v-if="currentAlert" class="assign-modal">
      <!-- 告警信息 -->
      <div class="assign-modal__alert-info">
        <a-descriptions :column="1" size="small" bordered>
          <a-descriptions-item label="告警 ID">
            {{ currentAlert.id }}
          </a-descriptions-item>
          <a-descriptions-item label="传感器">
            {{ currentAlert.sensorId }}
          </a-descriptions-item>
          <a-descriptions-item label="产线">
            {{ currentAlert.lineId }}
          </a-descriptions-item>
          <a-descriptions-item label="严重等级">
            <a-tag :color="currentAlert.severity === 'critical' ? 'red' : currentAlert.severity === 'high' ? 'orange' : 'gold'">
              {{ currentAlert.severity }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="消息">
            {{ currentAlert.message }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 分配表单 -->
      <div class="assign-modal__form">
        <a-form layout="vertical">
          <a-form-item label="责任人" required>
            <a-select
              v-model:value="assignedTo"
              placeholder="请选择责任人"
              show-search
              :options="assigneeOptions"
              :filter-option="(input: string, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              "
            />
          </a-form-item>

          <a-form-item label="备注">
            <a-textarea
              v-model:value="note"
              placeholder="可选填写分配备注"
              :rows="3"
              :maxlength="200"
              show-count
            />
          </a-form-item>
        </a-form>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.assign-modal__alert-info {
  margin-bottom: 24px;
}

.assign-modal__form {
  margin-top: 16px;
}
</style>
