<!-- AgvAddModal.vue AGV 新增车辆弹窗 -->
<!-- 阶段：🟣 重构阶段（高内聚、低耦合） -->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAddAgvMutation } from '@packages/shared';
import { AGV_STATUS_TEXT_MAP } from '@/constants';

/**
 * 📌 弹窗可见性（通过 props 控制）
 */
const props = defineProps<{
  visible: boolean;
}>();

/**
 * 📌 弹窗打开/关闭事件
 */
const emit = defineEmits<{
  'update:visible': [visible: boolean];
  'success': [];
}>();

/**
 * 📌 表单 ref 引用
 */
const formRef = ref<any>(null);

/**
 * 📌 新增表单数据
 */
const addForm = ref({
  id: '',
  x: undefined,
  y: undefined,
  status: undefined,
});

/**
 * 📌 新增表单校验规则
 */
const addFormRules = {
  id: [
    { required: true, message: '车号不能为空' },
    { pattern: /^AGV-\d{3}$/, message: '车号格式错误（如 AGV-001）' },
  ],
  x: [
    { required: true, message: 'X 坐标不能为空' },
  ],
  y: [
    { required: true, message: 'Y 坐标不能为空' },
  ],
  status: [
    { required: true, message: '状态不能为空' },
  ],
};

/**
 * 📌 Mutation Hook
 */
const mutation = useAddAgvMutation();

/**
 * 📌 表单加载状态
 */
const isFormLoading = computed(() => mutation.isPending);

/**
 * 📌 打开弹窗并重置表单（供外部调用）
 * @description 使用 defineExpose 暴露给父组件
 */
const open = () => {
  addForm.value = {
    id: '',
    x: undefined,
    y: undefined,
    status: undefined,
  };
  emit('update:visible', true);
};

/**
 * 📌 暴露方法供外部调用
 */
defineExpose({
  open,
});

/**
 * 📌 关闭弹窗
 */
const handleClose = () => {
  emit('update:visible', false);
};

/**
 * 📌 表单提交处理
 */
const handleFormSubmit = async () => {
  try {
    // ✅ 校验表单
    await formRef.value.validate();
    
    // ✅ 隐藏弹窗，显示加载状态
    emit('update:visible', false);
    
    // ✅ 提交数据
    mutation.mutate(addForm.value, {
      onSuccess: () => {
        // ✅ 成功后触发 success 事件
        emit('success');
      },
    });
  } catch (error) {
    // ✅ 校验失败
    console.error('表单校验失败:', error);
  }
};

/**
 * 📌 重置表单
 */
const handleResetForm = () => {
  addForm.value = {
    id: '',
    x: undefined,
    y: undefined,
    status: undefined,
  };
};

/**
 * 📌 状态选择器选项
 */
const statusOptions = [
  { value: 'idle', label: AGV_STATUS_TEXT_MAP.idle },
  { value: 'moving', label: AGV_STATUS_TEXT_MAP.moving },
  { value: 'error', label: AGV_STATUS_TEXT_MAP.error },
];
</script>

<template>
  <!-- ✅ 新增车辆弹窗 -->
  <a-modal
    v-model:open="visible"
    title="新增车辆"
    data-test="add-modal"
    :confirm-loading="isFormLoading"
    width="600px"
    :destroy-on-close="true"
    :mask-closable="false"
    @cancel="handleClose"
  >
    <!-- ✅ 表单 -->
    <a-form
      layout="vertical"
      :model="addForm"
      :rules="addFormRules"
      ref="formRef"
      @finish="handleFormSubmit"
    >
      <!-- 车号输入 -->
      <a-form-item label="车号" name="id">
        <a-input
          v-model:value="addForm.id"
          placeholder="请输入车号（如 AGV-001）"
          allow-clear
        />
      </a-form-item>

      <!-- X 坐标输入 -->
      <a-form-item label="X 坐标" name="x">
        <a-input-number
          v-model:value="addForm.x"
          :min="0"
          placeholder="请输入 X 坐标"
          style="width: 100%"
        />
      </a-form-item>

      <!-- Y 坐标输入 -->
      <a-form-item label="Y 坐标" name="y">
        <a-input-number
          v-model:value="addForm.y"
          :min="0"
          placeholder="请输入 Y 坐标"
          style="width: 100%"
        />
      </a-form-item>

      <!-- 状态选择 -->
      <a-form-item label="状态" name="status">
        <a-select
          v-model:value="addForm.status"
          placeholder="请选择状态"
          allow-clear
        >
          <a-select-option value="idle">{{ AGV_STATUS_TEXT_MAP.idle }}</a-select-option>
          <a-select-option value="moving">{{ AGV_STATUS_TEXT_MAP.moving }}</a-select-option>
          <a-select-option value="error">{{ AGV_STATUS_TEXT_MAP.error }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>

    <!-- 底部按钮 -->
    <template #footer>
      <a-button @click="handleClose">取消</a-button>
      <a-button
        type="primary"
        data-test="confirm-btn"
        @click="handleFormSubmit"
        :loading="isFormLoading"
      >
        确认新增
      </a-button>
    </template>
  </a-modal>
</template>
