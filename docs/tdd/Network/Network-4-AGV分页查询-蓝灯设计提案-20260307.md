# Network-4: AGV 分页查询功能 - 蓝灯设计提案

**阶段**：🟣 Milestone 3 深水区 - 阶段 0：蓝灯阶段（设计对齐）  
**日期**：2026-03-07  
**优先级**：P0（核心功能）  
**关联需求**：废弃本地 `DataBuffer` 占位，使用 Mock API + Vue Query

---

## 🎯 需求概述

废弃 `AgvList.vue` 的本地 `DataBuffer` 占位实现，在 `@packages/shared` 封装支持分页与搜索的 Mock API 及 Vue Query Hook，并在 Admin 后台渲染标准的 Ant Design Vue 表格页。

---

## 🔵 蓝灯阶段强制设计规范

### 1️⃣ 网络层接口设计

**文件路径**：`@packages/shared/src/network/api/agv.ts`

#### 参数接口

```typescript
export interface IAgvListParams {
  current: number;     // 当前页码（从 1 开始）
  pageSize: number;    // 每页条数
  keyword?: string;    // 搜索关键字（车号模糊匹配）
  status?: string;     // AGV 状态过滤（idle / moving / error）
}
```

**字段说明**：
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `current` | `number` | ✅ | 当前页码，从 1 开始 |
| `pageSize` | `number` | ✅ | 每页显示的条目数 |
| `keyword` | `string` | ❌ | 车号关键字搜索（可选） |
| `status` | `string` | ❌ | 状态过滤：`idle` / `moving` / `error`（可选） |

#### 响应接口

```typescript
export interface IAgvListResponse {
  total: number;      // 总数据条数
  list: IAgvData[];   // 当前页数据列表
}
```

**字段说明**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `total` | `number` | 符合条件的总数据量 |
| `list` | `IAgvData[]` | 当前页返回的数据数组 |

#### Mock 函数实现

```typescript
export async function fetchAgvList(params: IAgvListParams): Promise<IAgvListResponse> {
  // ✅ 延迟 500ms 模拟网络请求（提升用户体验感知）
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // ✅ 内置 20 条固定 Mock 数据
  const mockData: IAgvData[] = [
    { id: 'AGV-001', x: 120.5, y: 340.2, status: 'idle', timestamp: Date.now() },
    { id: 'AGV-002', x: 800.1, y: 150.8, status: 'moving', timestamp: Date.now() },
    { id: 'AGV-003', x: 450.0, y: 900.0, status: 'error', timestamp: Date.now() },
    { id: 'AGV-004', x: 320.4, y: 110.2, status: 'moving', timestamp: Date.now() },
    { id: 'AGV-005', x: 90.0, y: 80.0, status: 'idle', timestamp: Date.now() },
    { id: 'AGV-006', x: 560.2, y: 450.5, status: 'idle', timestamp: Date.now() },
    { id: 'AGV-007', x: 720.8, y: 280.3, status: 'moving', timestamp: Date.now() },
    { id: 'AGV-008', x: 180.3, y: 620.9, status: 'error', timestamp: Date.now() },
    { id: 'AGV-009', x: 410.7, y: 390.1, status: 'idle', timestamp: Date.now() },
    { id: 'AGV-010', x: 650.0, y: 520.4, status: 'moving', timestamp: Date.now() },
    { id: 'AGV-011', x: 230.5, y: 750.2, status: 'idle', timestamp: Date.now() },
    { id: 'AGV-012', x: 890.1, y: 180.7, status: 'error', timestamp: Date.now() },
    { id: 'AGV-013', x: 360.4, y: 420.8, status: 'moving', timestamp: Date.now() },
    { id: 'AGV-014', x: 510.9, y: 680.3, status: 'idle', timestamp: Date.now() },
    { id: 'AGV-015', x: 740.2, y: 250.6, status: 'moving', timestamp: Date.now() },
    { id: 'AGV-016', x: 170.7, y: 590.0, status: 'error', timestamp: Date.now() },
    { id: 'AGV-017', x: 420.0, y: 840.5, status: 'idle', timestamp: Date.now() },
    { id: 'AGV-018', x: 680.3, y: 310.2, status: 'moving', timestamp: Date.now() },
    { id: 'AGV-019', x: 290.6, y: 470.9, status: 'idle', timestamp: Date.now() },
    { id: 'AGV-020', x: 830.8, y: 140.4, status: 'error', timestamp: Date.now() },
  ];
  
  // ✅ 过滤逻辑
  let filtered = mockData;
  
  // 关键字过滤（车号模糊匹配）
  if (params.keyword && params.keyword.trim() !== '') {
    filtered = filtered.filter(d => 
      d.id.toLowerCase().includes(params.keyword!.toLowerCase().trim())
    );
  }
  
  // 状态过滤
  if (params.status && params.status.trim() !== '') {
    filtered = filtered.filter(d => d.status === params.status);
  }
  
  // ✅ 分页切片逻辑
  const total = filtered.length;
  const start = (params.current - 1) * params.pageSize;
  const end = start + params.pageSize;
  const paginated = filtered.slice(start, end);
  
  return {
    total,
    list: paginated,
  };
}
```

**实现细节说明**：
- `setTimeout(500)`：模拟真实网络延迟，提升用户感知
- 内置 20 条 Mock 数据：包含 3 种状态（idle/moving/error）
- 过滤逻辑：先关键字后状态，支持组合筛选
- 分页逻辑：使用 `slice(start, end)` 截取当前页数据

---

### 2️⃣ 状态机 Hook 设计

**文件路径**：`@packages/shared/src/network/queries/useAgvListQuery.ts`

#### Hook 接口定义

```typescript
import { useQuery, UseQueryResult } from '@tanstack/vue-query';
import { Ref } from 'vue';
import { IAgvListParams, IAgvListResponse, fetchAgvList } from '../api/agv';

/**
 * 📌 AGV 列表查询 Hook
 * @param params 响应式参数对象 Ref<IAgvListParams>
 * @returns UseQueryResult<IAgvListResponse, Error>
 */
export function useAgvListQuery(params: Ref<IAgvListParams>): UseQueryResult<IAgvListResponse, Error> {
  return useQuery({
    queryKey: ['agvList', params],           // ✅ 动态依赖参数
    queryFn: () => fetchAgvList(params.value),
    keepPreviousData: true,                  // ✅ 页面切换时保留上一页数据
    refetchOnWindowFocus: false,             // ❌ 禁用窗口聚焦自动刷新（避免频繁请求）
  });
}
```

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `params` | `Ref<IAgvListParams>` | 响应式参数对象，支持响应式更新自动触发查询 |

**返回值说明**：
| 属性名 | 类型 | 说明 |
|--------|------|------|
| `data` | `IAgvListResponse \| undefined` | 查询返回的数据 |
| `isLoading` | `boolean` | 是否处于加载中 |
| `isError` | `boolean` | 是否发生错误 |
| `error` | `Error \| null` | 错误对象 |
| `refetch` | `() => void` | 手动触发重新查询 |

**使用示例**：
```typescript
const queryParams = ref<IAgvListParams>({
  current: 1,
  pageSize: 10,
  keyword: '',
  status: undefined,
});

const { data, isLoading } = useAgvListQuery(queryParams);
```

---

### 3️⃣ 视图层重构设计

**文件路径**：`apps/admin/src/views/AgvList.vue`

#### 状态定义

```typescript
import { ref, computed } from 'vue';
import { useAgvListQuery } from '@packages/shared';

const queryParams = ref<IAgvListParams>({
  current: 1,
  pageSize: 10,
  keyword: '',
  status: undefined,
});

const query = useAgvListQuery(queryParams);

// ✅ 表格数据源（带空数组保护）
const tableData = computed(() => query.data?.list || []);

// ✅ 加载状态
const isLoading = computed(() => query.isLoading);

// ✅ 分页总数
const total = computed(() => query.data?.total || 0);
```

#### 搜索表单 UI

```vue
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
```

#### 事件处理函数

```typescript
// ✅ 搜索处理（重置为第 1 页）
const handleSearch = () => {
  queryParams.value.current = 1;
  query.refetch();
};

// ✅ 重置处理
const handleReset = () => {
  queryParams.value = {
    current: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
  };
  query.refetch();
};

// ✅ 状态颜色映射
const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    idle: 'success',
    moving: 'processing',
    error: 'error',
  };
  return map[status] || 'default';
};

// ✅ 状态文本映射
const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    idle: '空闲',
    moving: '移动中',
    error: '错误',
  };
  return map[status] || status;
};

// ✅ 分页配置（与 queryParams 双向绑定）
const paginationConfig = {
  current: queryParams.current,
  pageSize: queryParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number) => `共 ${total} 条`,
  onChange: (page: number, size: number) => {
    queryParams.value.current = page;
    queryParams.value.pageSize = size;
    query.refetch();
  },
};
```

#### 样式定义

```vue
<style scoped>
.agv-list {
  padding: 20px 0;
}

.agv-list__form {
  margin-bottom: 24px;
}
</style>
```

---

### 4️⃣ 导出规范与测试覆盖规划

#### 🔒 强制约束

**禁止行为**：
- ❌ 在 `views/index.ts` 等桶文件（Barrel File）中导出组件
- ❌ 使用 `@/views` 通配导入
- ❌ 在组件内直接使用 `DataBuffer.getInstance()`

**强制行为**：
- ✅ 所有引入必须使用**精确路径**：`import AgvList from '@/views/AgvList.vue'`
- ✅ 路由配置使用动态导入：`component: () => import('@/views/AgvList.vue')`
- ✅ 导出 `queryParams` 的 `Ref` 对象供测试断言使用

#### 📦 Export 示例如下：

```typescript
// ❌ 错误示例（桶文件）
// apps/admin/src/views/index.ts
export { default as AgvList } from './AgvList.vue';

// ✅ 正确示例（直接导入）
// apps/admin/src/router/index.ts
import AdminLayout from '@/layout/AdminLayout.vue';
const routes = [
  {
    path: '/agv',
    component: AdminLayout,
    children: [
      {
        path: '',
        component: () => import('@/views/AgvList.vue'),
      },
    ],
  },
];
```

---

#### 🧪 红灯阶段测试覆盖规划

**依赖 Mock 库**：
- `@tanstack/vue-query`：提供 `@testing-library/vue` + `jest-mock` macros
- `vi.mock()`：Mock `fetchAgvList` 函数

**测试用例设计**：

##### 测试用例 1：Loading 态验证

```typescript
// __tests__/views/AgvList.test.ts

it('显示 Loading 态', async () => {
  // Mock fetchAgvList 返回 Pending Promise
  const { getByRole, findByRole } = render(AgvList);
  
  // 预期表格显示 loading 标识
  const loadingIndicator = await findByRole('progressbar');
  expect(loadingIndicator).toBeInTheDocument();
});
```

##### 测试用例 2：空数据态验证

```typescript
it('处理空数据态', async () => {
  // Mock 返回空数据
  vi.mock('@packages/shared', async () => {
    const actual = await vi.importActual('@packages/shared');
    return {
      ...actual,
      fetchAgvList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
    };
  });

  const { getByText } = render(AgvList);
  
  // 预期表格不显示数据行
  const table = getByRole('table');
  expect(table.querySelectorAll('tbody tr')).toHaveLength(0);
  
  // 预期显示空状态提示
  expect(getByText(/暂无数据/i)).toBeInTheDocument();
});
```

##### 测试用例 3：搜索按钮更新逻辑

```typescript
it('搜索时重置 current 为 1', async () => {
  const { getByPlaceholderText, getByText } = render(AgvList);
  
  // 输入关键词
  const input = getByPlaceholderText('请输入车号');
  await userEvent.type(input, 'AGV-001');
  
  // 点击查询按钮
  await userEvent.click(getByText('查询'));
  
  // 断言 queryParams.current === 1
  expect(queryParams.value.current).toBe(1);
  expect(queryParams.value.keyword).toBe('AGV-001');
});
```

##### 测试用例 4：分页器联动验证

```typescript
it('分页器切换更新 queryParams', async () => {
  const { getByRole } = render(AgvList);
  
  // 获取分页器的下一页按钮
  const nextPageButton = getByRole('button', { name: /下一页/i });
  await userEvent.click(nextPageButton);
  
  // 断言 queryParams.current === 2
  expect(queryParams.value.current).toBe(2);
  
  // 断言 queryKey 包含更新后的参数
  expect(queryKey.value).toEqual(['agvList', expect.objectContaining({ current: 2 })]);
});
```

##### 测试用例 5：状态过滤验证

```typescript
it('状态过滤正确应用', async () => {
  const { getByText, getAllByText } = render(AgvList);
  
  // 点击状态选择器
  const select = getByText('请选择状态');
  await userEvent.click(select);
  
  // 选择 "空闲" 状态
  const idleOption = getByText('空闲');
  await userEvent.click(idleOption);
  
  // 点击查询
  await userEvent.click(getByText('查询'));
  
  // 预期只显示 idle 状态的 AGV
  const statusCells = getAllByText('空闲');
  expect(statusCells).toHaveLength(expectedIdleCount);
});
```

---

## 📋 交付物清单

| 文件路径 | 类型 | 状态 |
|----------|------|------|
| `@packages/shared/src/network/api/agv.ts` | API 实现 | 🔵 蓝灯阶段 |
| `@packages/shared/src/network/queries/useAgvListQuery.ts` | Hook 实现 | 🔵 蓝灯阶段 |
| `apps/admin/src/views/AgvList.vue` | 视图重构 | 🔵 蓝灯阶段 |
| `@packages/shared/__tests__/network/api/agv.test.ts` | API 测试 | 🟥 红灯阶段 |
| `apps/admin/__tests__/views/AgvList.test.ts` | 组件测试 | 🟥 红灯阶段 |

---

## ⚠️ 风险与注意事项

1. **类型安全**：`IAgvData` 接口必须包含 `id`, `x`, `y`, `status` 字段
2. **响应式更新**：`queryParams` 必须是 `ref` 对象，不能是 `reactive`
3. **Mock 数据量**：内置于 Mock 函数的 20 条数据必须覆盖所有状态组合
4. **过滤优先级**：关键字过滤优先于状态过滤（先匹配车号，再筛选状态）
5. **分页索引**：`current` 从 1 开始，非 0 基索引

---

## ✅ 通过标准

- ✅ 所有测试用例通过（100% 覆盖）
- ✅ 表格渲染正确显示空状态、加载态、数据态
- ✅ 分页器、搜索、状态过滤功能正常
- ✅ 代码无 TypeScript 类型错误

---

**设计提案输出完成，等待批准进入红灯阶段**。
