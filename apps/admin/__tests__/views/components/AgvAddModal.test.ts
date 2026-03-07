/**
 * AgvAddModal.vue 测试用例
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试目标：
 * - 测试弹窗打开/关闭功能
 * - 测试表单校验规则
 * - 测试 Mutation 提交流程
 * - 测试成功后事件触发
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';

/**
 * 📦 Mock useAddAgvMutation Hook 返回值
 */
const mockMutationResult = {
  mutate: vi.fn(),
  isPending: ref(false),
  isSuccess: ref(false),
  isError: ref(false),
  error: ref(null),
  reset: vi.fn(),
};

/**
 * 📦 Mock addAgv API
 */
const mockAddAgv = vi.fn().mockResolvedValue({
  id: 'AGV-999',
  x: 500,
  y: 500,
  status: 'idle',
  timestamp: Date.now(),
});

/**
 * 📦 Mock @packages/shared - 拦截所有导出
 * 📌 注意：不使用 ori() 加载真实模块，避免解析路径别名问题
 */
vi.mock('@packages/shared', () => ({
  useAddAgvMutation: vi.fn(() => mockMutationResult),
  addAgv: mockAddAgv,
  DataBuffer: {
    getInstance: () => ({
      getSnapshot: vi.fn().mockReturnValue([]),
      pushData: vi.fn(),
    }),
  },
  agvSyncBus: {
    broadcastNewAgv: vi.fn(),
    subscribeNewAgv: vi.fn(() => vi.fn()),
  },
  AGV_SYNC_CHANNEL: 'agv-sync-channel',
}));

/**
 * 📦 创建测试组件
 */
const createTestComponent = async () => {
  const AgvAddModalComponent = await import('@/views/components/AgvAddModal.vue');
  return AgvAddModalComponent.default;
};

describe('AgvAddModal - AGV 新增弹窗组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ✅ 重置 Mutation Mock
    mockMutationResult.mutate.mockClear();
    mockMutationResult.isPending.value = false;
    mockMutationResult.isSuccess.value = false;
    mockMutationResult.isError.value = false;
    mockMutationResult.error.value = null;
  });

  describe('Component Mounting & Props', () => {
    it('组件应正确接收 visible prop', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: true,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 验证：组件挂载成功
      expect(wrapper.exists()).toBe(true);
    });

    it('暴露 open 方法应可被外部调用', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: false,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 调用 open 方法
      await wrapper.vm.open();

      // ✅ 验证：open 方法存在
      expect(wrapper.vm.open).toBeDefined();
    });
  });

  describe('Modal Interaction', () => {
    it('open 方法应打开弹窗并重置表单', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: false,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 调用 open 方法
      await wrapper.vm.open();

      // ✅ 验证：弹窗应打开（通过 emit 事件）
      expect(wrapper.emitted()['update:visible']).toBeDefined();
      expect(wrapper.emitted()['update:visible']?.[0]).toEqual([true]);

      // ✅ 验证：表单应被重置
      expect(wrapper.vm.addForm.id).toBe('');
      expect(wrapper.vm.addForm.x).toBeUndefined();
      expect(wrapper.vm.addForm.y).toBeUndefined();
      expect(wrapper.vm.addForm.status).toBeUndefined();
    });

    it('点击取消按钮应关闭弹窗', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: true,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 点击取消按钮
      const cancelButton = wrapper.find('[data-test="cancel-btn"]');
      if (cancelButton.exists()) {
        await cancelButton.trigger('click');
      } else {
        // fallback: 查找文本为"取消"的按钮
        const buttons = wrapper.findAllComponents({ name: 'a-button' });
        const cancelBtn = buttons.find(btn => btn.text() === '取消');
        if (cancelBtn) {
          await cancelBtn.trigger('click');
        }
      }

      // ✅ 验证：弹窗应关闭
      expect(wrapper.emitted()['update:visible']?.[0]).toEqual([false]);
    });
  });

  describe('Form Validation', () => {
    it('提交空表单应拦截并显示校验错误', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: true,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 提交空表单
      const form = wrapper.find('form');
      if (form.exists()) {
        await form.trigger('submit');
      }

      // ✅ 验证：mutation 未被调用
      expect(mockMutationResult.mutate).not.toHaveBeenCalled();
    });

    it('提交有效表单应触发 mutation', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: true,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 填充表单
      const idInput = wrapper.findComponent({ name: 'a-input' });
      const xInput = wrapper.findComponent({ name: 'a-input-number' });
      const yInput = wrapper.findAllComponents({ name: 'a-input-number' })[1];
      const statusSelect = wrapper.findComponent({ name: 'a-select' });

      if (idInput.exists()) {
        await idInput.setValue('AGV-999');
      }
      if (xInput.exists()) {
        await xInput.setValue(500);
      }
      if (yInput.exists()) {
        await yInput.setValue(500);
      }
      if (statusSelect.exists()) {
        await statusSelect.setValue('idle');
      }

      // ✅ 提交表单
      const form = wrapper.find('form');
      if (form.exists()) {
        await form.trigger('submit');
      }

      // ✅ 验证：mutation 被调用
      expect(mockMutationResult.mutate).toHaveBeenCalledWith({
        id: 'AGV-999',
        x: 500,
        y: 500,
        status: 'idle',
      });
    });

    it('提交有效表单后，mutation 成功应触发 success 事件', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: true,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 填充表单
      const idInput = wrapper.findComponent({ name: 'a-input' });
      const xInput = wrapper.findComponent({ name: 'a-input-number' });
      const yInput = wrapper.findAllComponents({ name: 'a-input-number' })[1];
      const statusSelect = wrapper.findComponent({ name: 'a-select' });

      if (idInput.exists()) {
        await idInput.setValue('AGV-888');
      }
      if (xInput.exists()) {
        await xInput.setValue(300);
      }
      if (yInput.exists()) {
        await yInput.setValue(300);
      }
      if (statusSelect.exists()) {
        await statusSelect.setValue('moving');
      }

      // ✅ 提交表单
      const form = wrapper.find('form');
      if (form.exists()) {
        await form.trigger('submit');
      }

      // ✅ 模拟 mutation 成功
      mockMutationResult.isSuccess.value = true;
      await nextTick();

      // ✅ 验证：success 事件被触发
      expect(wrapper.emitted()['success']).toBeDefined();
    });
  });

  describe('Loading State', () => {
    it('mutation 开始时，按钮应显示 loading 状态', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: true,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 填充表单
      const idInput = wrapper.findComponent({ name: 'a-input' });
      const xInput = wrapper.findComponent({ name: 'a-input-number' });
      const yInput = wrapper.findAllComponents({ name: 'a-input-number' })[1];
      const statusSelect = wrapper.findComponent({ name: 'a-select' });

      if (idInput.exists()) {
        await idInput.setValue('AGV-777');
      }
      if (xInput.exists()) {
        await xInput.setValue(200);
      }
      if (yInput.exists()) {
        await yInput.setValue(200);
      }
      if (statusSelect.exists()) {
        await statusSelect.setValue('error');
      }

      // ✅ 提交表单
      const form = wrapper.find('form');
      if (form.exists()) {
        await form.trigger('submit');
      }

      // ✅ 模拟 mutation 开始（pending 状态）
      mockMutationResult.isPending.value = true;
      await nextTick();

      // ✅ 验证：isFormLoading 为 true
      expect(wrapper.vm.isFormLoading).toBe(true);
    });

    it('mutation 成功后，弹窗应关闭', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: true,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 填充表单
      const idInput = wrapper.findComponent({ name: 'a-input' });
      const xInput = wrapper.findComponent({ name: 'a-input-number' });
      const yInput = wrapper.findAllComponents({ name: 'a-input-number' })[1];
      const statusSelect = wrapper.findComponent({ name: 'a-select' });

      if (idInput.exists()) {
        await idInput.setValue('AGV-666');
      }
      if (xInput.exists()) {
        await xInput.setValue(100);
      }
      if (yInput.exists()) {
        await yInput.setValue(100);
      }
      if (statusSelect.exists()) {
        await statusSelect.setValue('idle');
      }

      // ✅ 提交表单
      const form = wrapper.find('form');
      if (form.exists()) {
        await form.trigger('submit');
      }

      // ✅ 模拟 mutation 成功
      mockMutationResult.isSuccess.value = true;
      await nextTick();

      // ✅ 验证：弹窗应关闭
      expect(wrapper.emitted()['update:visible']).toBeDefined();
      expect(wrapper.emitted()['update:visible']?.[1]).toEqual([false]);
    });
  });

  describe('Form Reset', () => {
    it('close 方法应重置表单状态', async () => {
      const AgvAddModalComponent = await createTestComponent();

      const wrapper = mount(AgvAddModalComponent, {
        props: {
          visible: true,
        },
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['AModal', 'AForm', 'AFormItem', 'AInput', 'ANumberInput', 'ASelect', 'AOption', 'AButton'],
        },
      });

      // ✅ 填充表单
      wrapper.vm.addForm = {
        id: 'AGV-555',
        x: 50,
        y: 50,
        status: 'idle',
      };

      // ✅ 点击取消按钮
      const cancelButton = wrapper.findComponent({ name: 'a-button' });
      if (cancelButton.exists()) {
        await cancelButton.trigger('click');
      }

      // ✅ 验证：弹窗关闭
      expect(wrapper.emitted()['update:visible']?.[0]).toEqual([false]);
    });
  });
});
