<!-- AgvList.vue AGV 车辆管理 -->
<!-- 阶段：🟣 重构阶段（精简主页面） -->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAgvListQuery } from '@packages/shared';
import type { IAgvListParams } from '@packages/shared';
import { AGV_STATUS_TEXT_MAP, AGV_STATUS_COLOR_MAP } from '@/constants';

/**
 * 📌 查询参数状态
 * @description 高度聚合的查询参数对象
 */
const queryParams = ref<IAgvListParams>({
  current: 1,
  pageSize: 10,
  keyword: '',
  status: undefined,
});

/**
 * 📌 Vue Query Hook
 */
const query = useAgvListQuery(queryParams);

/**
 * 📌 加载状态（列表查询）
 */
const isLoading = computed(() => query.isLoading);

/**
 * 📌 表格数据源（带空数组保护）
 */
const tableData = computed(() => query.data?.list || []);

/**
 * 📌 分页总数
 */
const total = computed(() => query.data?.total || 0);

/**
 * 📌 搜索处理（重置为第 1 页）
 */
const handleSearch = () => {
  queryParams.value.current = 1;
  query.refetch();
};

/**
 * 📌 重置处理
 */
const handleReset = () => {
  queryParams.value = {
    current: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
  };
  query.refetch();
};

/**
 * 📌 分页器切换处理
 */
const handlePagination = (page: number, size: number) => {
  queryParams.value.current = page;
  queryParams.value.pageSize = size;
  query.refetch();
};

/**
 * 📌 新增车辆弹窗状态
 */
const modalVisible = ref(false);

/**
 * 📌 新增车辆弹窗 ref 引用
 */
const addModalRef = ref<any>(null);

/**
 * 📌 打开新增车辆弹窗
 */
const handleOpenAddModal = () => {
  addModalRef.value?.open();
  modalVisible.value = true;
};

/**
 * 📌 新增成功后刷新列表
 */
const handleAddSuccess = () => {
  query.refetch();
};

/**
 * 📌 表格列配置（数据化）
 */
const columns = [
  { title: 'ID', dataIndex: 'id', width: 120, key: 'id' },
  { title: 'X 坐标', dataIndex: 'x', width: 120, key: 'x' },
  { title: 'Y 坐标', dataIndex: 'y', width: 120, key: 'y' },
  { title: '状态', dataIndex: 'status', width: 120, key: 'status' },
];

/**
 * 📌 状态标签渲染（复用 map）
 */
const getStatusColor = (status: string): string =>
  AGV_STATUS_COLOR_MAP[status] || 'default';

const getStatusText = (status: string): string =>
  AGV_STATUS_TEXT_MAP[status] || status;

/**
 * 📌 分页配置（与 queryParams 双向绑定）
 * ✅ 核心修复：必须使用 computed 包裹，否则会丢失响应式导致分页器卡死！
 */
const paginationConfig = computed(() => ({
  current: queryParams.value.current,
  pageSize: queryParams.value.pageSize,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (t: number) => `共 ${t} 条`,
  onChange: handlePagination,
}));

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
  <div class="agv-list">
    <a-card title="AGV 车辆管理">
      <!-- 搜索表单区 -->
      <a-form
        layout="inline"
        :model="queryParams"
        @finish="handleSearch"
        class="agv-list__form"
      >
        <!-- 车号输入框 -->
        <a-form-item name="keyword">
          <a-input
            v-model:value="queryParams.keyword"
            placeholder="请输入车号"
            allow-clear
            style="width: 180px"
          />
        </a-form-item>

        <!-- 状态选择器 -->
        <a-form-item name="status">
          <a-select
            v-model:value="queryParams.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 120px"
          >
            <a-select-option value="idle">{{ AGV_STATUS_TEXT_MAP.idle }}</a-select-option>
            <a-select-option value="moving">{{ AGV_STATUS_TEXT_MAP.moving }}</a-select-option>
            <a-select-option value="error">{{ AGV_STATUS_TEXT_MAP.error }}</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 查询按钮 -->
        <a-form-item>
          <a-button type="primary" html-type="submit" :disabled="isLoading">
            查询
          </a-button>
        </a-form-item>

        <!-- 重置按钮 -->
        <a-form-item>
          <a-button @click="handleReset" :disabled="isLoading">
            重置
          </a-button>
        </a-form-item>

        <!-- ✅ 新增车辆按钮 -->
        <a-form-item>
          <a-button
            type="primary"
            data-test="add-btn"
            @click="handleOpenAddModal"
            :disabled="isLoading"
          >
            新增车辆
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 数据表格区 -->
      <a-table
        :dataSource="tableData"
        :loading="isLoading"
        :columns="columns"
        :pagination="paginationConfig"
        :scroll="{ x: 'max-content' }"
        size="middle"
        rowKey="id"
      >
        <!-- 状态列自定义渲染 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor((record as { status: string }).status)">
              {{ getStatusText((record as { status: string }).status) }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- ✅ 新增车辆弹窗组件 -->
    <AgvAddModal
      ref="addModalRef"
      :visible="modalVisible"
      @update:visible="modalVisible = $event"
      @success="handleAddSuccess"
    />
  </div>
</template>

<style scoped>
.agv-list {
  padding: 20px 0;
}

.agv-list__form {
  margin-bottom: 24px;
}
</style>
