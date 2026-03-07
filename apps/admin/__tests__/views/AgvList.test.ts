/**
 * AgvList.vue 测试用例
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试目标：
 * - 使用 vi.mock('@packages/shared') 拦截 useAgvListQuery Hook
 * - 测试 Loading 态、空数据态、搜索和分页功能
 * - 补全蓝灯提案中承诺的 5 个 UI 测试用例
 * - 测试通过 VueQueryPlugin 初始化
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';

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
 * 📦 Mock fetchAgvList API
 */
const mockFetchAgvList = vi.fn().mockResolvedValue({
  total: 20,
  list: [],
});

/**
 * 📦 Mock @packages/shared - 拦截 useAgvListQuery 和 fetchAgvList
 */
vi.mock('@packages/shared', () => ({
  useAgvListQuery: vi.fn(() => mockQueryResult),
  fetchAgvList: mockFetchAgvList,
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
