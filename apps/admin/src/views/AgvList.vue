<!-- AgvList.vue AGV 车辆管理 -->
<!-- 阶段：🟢 绿灯阶段（业务实现） -->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAgvListQuery } from '@packages/shared';
import type { IAgvListParams } from '@packages/shared';

/**
 * 📌 查询参数状态
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
 * 📌 表格数据源（带空数组保护）
 */
const tableData = computed(() => query.data?.list || []);

/**
 * 📌 加载状态
 */
const isLoading = computed(() => query.isLoading);

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
 * 📌 状态颜色映射
 */
const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    idle: 'success',
    moving: 'processing',
    error: 'error',
  };
  return map[status] || 'default';
};

/**
 * 📌 状态文本映射
 */
const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    idle: '空闲',
    moving: '移动中',
    error: '错误',
  };
  return map[status] || status;
};

/**
 * 📌 分页配置（与 queryParams 双向绑定）
 */
const paginationConfig = {
  current: queryParams.current,
  pageSize: queryParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (t: number) => `共 ${t} 条`,
  onChange: (page: number, size: number) => {
    handlePagination(page, size);
  },
};
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
            <a-select-option value="idle">空闲</a-select-option>
            <a-select-option value="moving">移动中</a-select-option>
            <a-select-option value="error">错误</a-select-option>
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
      </a-form>

      <!-- 数据表格区 -->
      <a-table
        :dataSource="tableData"
        :loading="isLoading"
        :pagination="paginationConfig"
        :scroll="{ x: 'max-content' }"
        size="middle"
        rowKey="id"
      >
        <a-table-column title="ID" dataIndex="id" width="120" />
        <a-table-column title="X 坐标" dataIndex="x" width="120" />
        <a-table-column title="Y 坐标" dataIndex="y" width="120" />
        <a-table-column title="状态" dataIndex="status" width="120">
          <template #cell="{ text }">
            <a-tag :color="getStatusColor(text)">
              {{ getStatusText(text) }}
            </a-tag>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
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
