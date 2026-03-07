/**
 * AgvList.vue 测试用例
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试目标：
 * - 使用 vi.mock('@packages/shared') 拦截 useAgvListQuery Hook 和 useAddAgvMutation Hook
 * - 测试新增车辆功能的 7 个 UI 测试用例
 * - 测试通过 VueQueryPlugin 初始化
 * - Mock queryClient.invalidateQueries 验证缓存失效
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, reactive, onMounted } from 'vue';
import { VueQueryPlugin, useQueryClient } from '@tanstack/vue-query';
import { createPinia, setActivePinia } from 'pinia';

/**
 * 📦 Mock useAgvListQuery Hook 返回值
 */
const mockQueryResult = {
  data: ref({ total: 20, list: [] }),
  isLoading: ref(true),
  isError: ref(false),
  error: ref(null),
  refetch: vi.fn(),
};

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
 * 📦 Mock fetchAgvList API
 */
const mockFetchAgvList = vi.fn().mockResolvedValue({
  total: 20,
  list: [],
});

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
 * 📦 Mock queryClient.invalidateQueries（用于验证缓存失效）
 */
const mockQueryClient = {
  invalidateQueries: vi.fn(),
};

/**
 * 📦 Mock @packages/shared - 拦截所有导出
 */
vi.mock('@packages/shared', async (ori) => ({
  ...(await ori),
  useAgvListQuery: vi.fn(() => mockQueryResult),
  useAddAgvMutation: vi.fn(() => mockMutationResult),
  fetchAgvList: mockFetchAgvList,
  addAgv: mockAddAgv,
  queryClient: mockQueryClient,
}));

/**
 * 📦 Mock 使用 Transition 的组件（避免异步警告）
 */
const createTestComponent = async () => {
  const AgvListComponent = await import('@/views/AgvList.vue');
  return AgvListComponent.default;
};

describe('AgvList - AGV List Page (Green Light Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // ✅ 重置 Mock 数据
    mockQueryResult.data.value = { total: 0, list: [] };
    mockQueryResult.isLoading.value = true;
    mockQueryResult.isError.value = false;
    mockQueryResult.error.value = null;
    mockFetchAgvList.mockClear();
  });

  describe('Component Mounting & Hook Integration', () => {
    it('组件挂载后，应正确初始化 useAgvListQuery Hook', async () => {
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      expect(wrapper.exists()).toBe(true);
      
      // ✅ 验证 queryParams 初始化正确
      expect(wrapper.vm.queryParams.current).toBe(1);
      expect(wrapper.vm.queryParams.pageSize).toBe(10);
      expect(wrapper.vm.queryParams.keyword).toBe('');
      expect(wrapper.vm.queryParams.status).toBeUndefined();
    });

    it('应正确调用 useAgvListQuery Hook', async () => {
      const AgvListComponent = await createTestComponent();
      
      mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 验证 useAgvListQuery 被调用
      expect((useAgvListQuery as any).mock.calls.length).toBe(1);
    });
  });

  describe('Loading State', () => {
    it('数据加载中时，应显示 Loading 态', async () => {
      mockQueryResult.isLoading.value = true;
      mockQueryResult.data.value = { total: 0, list: [] };
      
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 验证：loading 状态为 true
      expect(wrapper.vm.isLoading.value).toBe(true);
    });

    it('数据加载完成后，应隐藏 Loading 态', async () => {
      mockQueryResult.isLoading.value = false;
      mockQueryResult.data.value = { 
        total: 5, 
        list: [{ id: 'AGV-001', x: 100, y: 200, status: 'idle', timestamp: Date.now() }] 
      };
      
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 验证：loading 状态为 false
      expect(wrapper.vm.isLoading.value).toBe(false);
    });

    it('空数据态时，表格应不显示数据行', async () => {
      mockQueryResult.isLoading.value = false;
      mockQueryResult.data.value = { total: 0, list: [] };
      
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 验证：tableData 应为空数组
      expect(wrapper.vm.tableData).toEqual([]);
    });
  });

  describe('Search Functionality', () => {
    it('搜索按钮应重置 current 为 1', async () => {
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 设置搜索参数
      wrapper.vm.queryParams.keyword = 'AGV-001';
      
      // ✅ 触发搜索
      await wrapper.vm.handleSearch();
      
      // ✅ 验证：current 被重置为 1
      expect(wrapper.vm.queryParams.current).toBe(1);
      expect(wrapper.vm.queryParams.keyword).toBe('AGV-001');
      
      // ✅ 验证：refetch 被调用
      expect(mockQueryResult.refetch).toHaveBeenCalled();
    });

    it('重置按钮应清空所有查询参数', async () => {
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 设置一些查询参数
      wrapper.vm.queryParams.keyword = 'AGV-001';
      wrapper.vm.queryParams.status = 'idle';
      
      // ✅ 触发重置
      await wrapper.vm.handleReset();
      
      // ✅ 验证：所有参数被重置为初始值
      expect(wrapper.vm.queryParams.keyword).toBe('');
      expect(wrapper.vm.queryParams.status).toBeUndefined();
      expect(wrapper.vm.queryParams.current).toBe(1);
    });

    it('状态过滤应正确触发查询', async () => {
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 设置状态过滤
      wrapper.vm.queryParams.status = 'idle';
      wrapper.vm.queryParams.current = 3; // 假设用户在第 3 页
      
      // ✅ 触发搜索
      await wrapper.vm.handleSearch();
      
      // ✅ 验证：current 被重置为 1
      expect(wrapper.vm.queryParams.current).toBe(1);
      expect(wrapper.vm.queryParams.status).toBe('idle');
      
      // ✅ 验证：refetch 被调用
      expect(mockQueryResult.refetch).toHaveBeenCalled();
    });
  });

  describe('Pagination Functionality', () => {
    it('分页器切换应更新 queryParams', async () => {
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 模拟分页器切换到第 2 页
      const newPage = 2;
      const newSize = 20;
      
      await wrapper.vm.handlePagination(newPage, newSize);
      
      // ✅ 验证：queryParams 更新
      expect(wrapper.vm.queryParams.current).toBe(newPage);
      expect(wrapper.vm.queryParams.pageSize).toBe(newSize);
      
      // ✅ 验证：refetch 被调用
      expect(mockQueryResult.refetch).toHaveBeenCalled();
    });

    it('分页切换应触发 Vue Query 新请求', async () => {
      const AgvListComponent = await createTestComponent();
      
      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      const refetchMock = vi.fn();
      mockQueryResult.refetch = refetchMock;

      // ✅ 模拟分页器切换
      await wrapper.vm.handlePagination(2, 20);
      
      // ✅ 验证：refetch 被调用
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  describe('Response Data Processing', () => {
    it('分页数据应正确计算 slice 范围', async () => {
      mockQueryResult.data.value = {
        total: 20,
        list: Array(10).fill({ id: 'AGV-001', x: 100, y: 200, status: 'idle', timestamp: Date.now() })
      };

      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
        },
      });

      // ✅ 验证：数据正确映射到 tableData
      expect(wrapper.vm.tableData).toHaveLength(10);
      expect(wrapper.vm.total).toBe(20);
    });
  });
});

/**
 * 📌 新增车辆功能测试用例（红灯阶段）
 * @description 测试红灯阶段：useAddAgvMutation 和弹窗 UI 未实现，测试应全部失败
 */
describe('AgvList - 新增车辆功能 (Red Light Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ✅ 重置 Mock 数据
    mockQueryResult.data.value = { total: 0, list: [] };
    mockQueryResult.isLoading.value = true;
    mockQueryResult.isError.value = false;
    mockQueryResult.error.value = null;

    // ✅ 重置 Mutation Mock
    mockMutationResult.mutate.mockClear();
    mockMutationResult.isPending.value = false;
    mockMutationResult.isSuccess.value = false;
    mockMutationResult.isError.value = false;
    mockMutationResult.error.value = null;
  });

  describe('Add Button & Modal Interaction', () => {
    it('点击"新增车辆"按钮应打开弹窗', async () => {
      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink', 'AModal', 'ANumberInput'],
        },
      });

      // ✅ 点击"新增车辆"按钮
      const addButton = wrapper.find('[data-test="add-btn"]');
      expect(addButton.exists()).toBe(true);

      await addButton.trigger('click');

      // ✅ 验证：弹窗应显示
      expect(wrapper.findComponent({ ref: 'addModal' }).exists()).toBe(true);
    });

    it('弹窗打开时表单应重置（清空所有字段）', async () => {
      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink', 'AModal', 'ANumberInput'],
        },
      });

      // ✅ 点击"新增车辆"按钮打开弹窗
      await wrapper.find('[data-test="add-btn"]').trigger('click');

      // ✅ 验证：表单字段应被重置
      // 红灯阶段：由于未实现，这些字段不存在或为默认值
      expect(wrapper.vm.addForm).toBeDefined();
      expect(wrapper.vm.addForm.id).toBe('');
      expect(wrapper.vm.addForm.x).toBeUndefined();
      expect(wrapper.vm.addForm.y).toBeUndefined();
      expect(wrapper.vm.addForm.status).toBeUndefined();
    });

    it('弹窗打开时，确认按钮loading状态应为false', async () => {
      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink', 'AModal', 'ANumberInput'],
        },
      });

      // ✅ 点击"新增车辆"按钮
      await wrapper.find('[data-test="add-btn"]').trigger('click');

      // ✅ 验证：isPending 应为 false（mutation 未触发）
      expect(wrapper.vm.isPending.value).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('提交空表单应拦截请求并显示校验错误信息', async () => {
      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink', 'AModal', 'ANumberInput'],
        },
      });

      // ✅ 打开弹窗
      await wrapper.find('[data-test="add-btn"]').trigger('click');

      // ✅ 提交空表单
      const form = wrapper.find('form');
      await form.trigger('submit');

      // ✅ 验证：mutation.mutate 未被调用（请求被拦截）
      expect(mockMutationResult.mutate).not.toHaveBeenCalled();

      // ✅ 验证：弹窗保持打开状态
      expect(wrapper.findComponent({ ref: 'addModal' }).exists()).toBe(true);
    });

    it('提交有效表单应触发 mutation.mutate', async () => {
      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink', 'AModal', 'ANumberInput'],
        },
      });

      // ✅ 打开弹窗
      await wrapper.find('[data-test="add-btn"]').trigger('click');

      // ✅ 填充表单
      await wrapper.find('input[name="id"]').setValue('AGV-999');
      await wrapper.find('input[name="x"]').setValue(500);
      await wrapper.find('input[name="y"]').setValue(500);
      await wrapper.find('select[name="status"]').setValue('idle');

      // ✅ 提交表单
      const form = wrapper.find('form');
      await form.trigger('submit');

      // ✅ 验证：mutation.mutate 被调用，入参正确
      expect(mockMutationResult.mutate).toHaveBeenCalledWith({
        id: 'AGV-999',
        x: 500,
        y: 500,
        status: 'idle',
      });
    });

    it('mutation 成功后应自动失效列表缓存', async () => {
      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink', 'AModal', 'ANumberInput'],
        },
      });

      // ✅ 打开弹窗并提交
      await wrapper.find('[data-test="add-btn"]').trigger('click');
      await wrapper.find('input[name="id"]').setValue('AGV-888');
      await wrapper.find('input[name="x"]').setValue(300);
      await wrapper.find('input[name="y"]').setValue(300);
      await wrapper.find('select[name="status"]').setValue('moving');
      await wrapper.find('form').trigger('submit');

      // ✅ 模拟 mutation 成功
      mockMutationResult.isSuccess.value = true;
      await nextTick();

      // ✅ 验证：queryClient.invalidateQueries 被调用
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['agvList'],
      });
    });

    it('提交时确认按钮应显示 loading 状态（isPending）', async () => {
      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink', 'AModal', 'ANumberInput'],
        },
      });

      // ✅ 打开弹窗并提交
      await wrapper.find('[data-test="add-btn"]').trigger('click');
      await wrapper.find('input[name="id"]').setValue('AGV-777');
      await wrapper.find('input[name="x"]').setValue(200);
      await wrapper.find('input[name="y"]').setValue(200);
      await wrapper.find('select[name="status"]').setValue('error');
      await wrapper.find('form').trigger('submit');

      // ✅ 模拟 mutation 开始（pending 状态）
      mockMutationResult.isPending.value = true;
      await nextTick();

      // ✅ 验证：isPending 为 true
      expect(wrapper.vm.isPending.value).toBe(true);
    });
  });

  describe('Modal Close & Reset', () => {
    it('关闭弹窗应重置表单状态', async () => {
      const AgvListComponent = await createTestComponent();

      const wrapper = mount(AgvListComponent, {
        global: {
          plugins: [VueQueryPlugin],
          stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink', 'AModal', 'ANumberInput'],
        },
      });

      // ✅ 打开弹窗
      await wrapper.find('[data-test="add-btn"]').trigger('click');

      // ✅ 填充表单
      wrapper.vm.addForm = reactive({
        id: 'AGV-666',
        x: 100,
        y: 100,
        status: 'idle',
      });

      // ✅ 关闭弹窗
      const modal = wrapper.findComponent({ ref: 'addModal' });
      await modal.vm.$emit('cancel');

      // ✅ 验证：弹窗关闭
      expect(modal.exists()).toBe(false);

      // ✅ 验证：再次打开时表单已重置
      await wrapper.find('[data-test="add-btn"]').trigger('click');
      expect(wrapper.vm.addForm.id).toBe('');
    });
  });
});
