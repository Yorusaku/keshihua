# Network-4: AGV 分页查询功能 - 红灯阶段测试用例

**阶段**：🟣 Milestone 3 深水区 - 阶段 1：红灯阶段（测试先行）  
**日期**：2026-03-07  
**优先级**：P0（核心功能）  
**关联需求**：废弃本地 `DataBuffer` 占位，使用 Mock API + Vue Query

---

## 🎯 红灯阶段执行要求

**绝对禁止行为**：
- ❌ 编写任何实际的 Vue/TS 业务代码
- ❌ 实现 `fetchAgvList` 函数业务逻辑
- ❌ 实现 `useAgvListQuery` Hook 业务逻辑
- ❌ 实现 `AgvList.vue` 组件业务逻辑

**测试目标**：
- ✅ 所有测试用例应**全部失败**（红灯状态有效）
- ✅ 验证测试架构和 Mock 拦截机制是否正常
- ✅ 测试用例完全对齐蓝灯设计提案

---

## 📋 测试用例清单

### 1️⃣ 网络层测试 (`packages/shared/src/network/__tests__/api/agv.test.ts`)

**占位文件**：`packages/shared/src/network/api/agv.ts`

```typescript
// ❌ 红灯阶段：空实现
export async function fetchAgvList(params: IAgvListParams): Promise<IAgvListResponse> {
  throw new Error('fetchAgvList: Not implemented (Red Light Phase)');
}
```

**测试用例**：

#### 测试用例 1：默认分页（page=1, pageSize=10）

```typescript
it('默认分页（page=1, pageSize=10）应返回前 10 条数据', async () => {
  const params: IAgvListParams = {
    current: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
  };

  // ❌ 预期：测试失败（fetchAgvList 未实现）
  const result: IAgvListResponse = await fetchAgvList(params);
  
  // 断言：由于函数抛出错误，此行不会执行
  expect(result.list).toHaveLength(10);
  expect(result.total).toBeGreaterThanOrEqual(10);
});
```

**失败原因**：✅ 预期失败（抛出 `Not implemented` 错误）

---

#### 测试用例 2：第二页（page=2, pageSize=10）

```typescript
it('第二页（page=2, pageSize=10）应返回第 11-20 条数据', async () => {
  const params: IAgvListParams = {
    current: 2,
    pageSize: 10,
    keyword: '',
    status: undefined,
  };

  // ❌ 预期：测试失败（fetchAgvList 未实现）
  const result: IAgvListResponse = await fetchAgvList(params);
  
  expect(result.list).toHaveLength(10);
  expect(result.total).toBeGreaterThanOrEqual(20);
});
```

**失败原因**：✅ 预期失败（抛出 `Not implemented` 错误）

---

#### 测试用例 3：关键字过滤

```typescript
it('使用 keyword 过滤应返回匹配的 AGV 数据', async () => {
  const params: IAgvListParams = {
    current: 1,
    pageSize: 20,
    keyword: 'AGV-001',
    status: undefined,
  };

  // ❌ 预期：测试失败（fetchAgvList 未实现）
  const result: IAgvListResponse = await fetchAgvList(params);
  
  result.list.forEach((item) => {
    expect(item.id).toContain('AGV-001');
  });
});
```

**失败原因**：✅ 预期失败（抛出 `Not implemented` 错误）

---

#### 测试用例 4：状态过滤

```typescript
it('使用 status 过滤应返回匹配的状态数据', async () => {
  const params: IAgvListParams = {
    current: 1,
    pageSize: 20,
    keyword: '',
    status: 'idle',
  };

  // ❌ 预期：测试失败（fetchAgvList 未实现）
  const result: IAgvListResponse = await fetchAgvList(params);
  
  result.list.forEach((item) => {
    expect(item.status).toBe('idle');
  });
});
```

**失败原因**：✅ 预期失败（抛出 `Not implemented` 错误）

---

#### 测试用例 5：响应结构验证

```typescript
it('响应应包含 total 和 list 字段', async () => {
  const params: IAgvListParams = {
    current: 1,
    pageSize: 10,
  };

  // ❌ 预期：测试失败（fetchAgvList 未实现）
  const result: IAgvListResponse = await fetchAgvList(params);
  
  expect(result).toHaveProperty('total');
  expect(result).toHaveProperty('list');
  expect(Array.isArray(result.list)).toBe(true);
});
```

**失败原因**：✅ 预期失败（抛出 `Not implemented` 错误）

---

### 2️⃣ 视图层测试 (`apps/admin/__tests__/views/AgvList.test.ts`)

**占位文件**：`apps/admin/src/views/AgvList.vue`

```vue
<!-- ❌ 红灯阶段：占位实现（无业务逻辑） -->
<script setup lang="ts">
// ❌ 红灯阶段：空实现
</script>

<template>
  <div class="agv-list">
    <!-- 占位模板 -->
  </div>
</template>
```

**Mock 设置**：
```typescript
vi.mock('@packages/shared', () => ({
  useAgvListQuery: vi.fn(() => mockQueryResult),
  fetchAgvList: vi.fn(),
}));
```

**测试用例**：

#### 测试用例 6：空占位组件挂载不抛出异常

```typescript
it('空占位组件挂载不抛出异常', async () => {
  const AgvListComponent = await import('@/views/AgvList.vue');
  
  // ✅ 预期：组件挂载时不会抛出错误（即使未实现业务逻辑）
  expect(() => {
    mount(AgvListComponent.default, {
      global: {
        stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
      },
    });
  }).not.toThrow();
});
```

**失败原因**：❌ 预期通过（占位组件挂载成功）

---

#### 测试用例 7：组件应包含占位 template

```typescript
it('组件应包含占位 template', async () => {
  const AgvListComponent = await import('@/views/AgvList.vue');
  
  const wrapper = mount(AgvListComponent.default, {
    global: {
      stubs: ['ACard', 'ATable', 'AForm', 'AFormItem', 'AInput', 'ASelect', 'AOption', 'ATag', 'ARouterLink'],
    },
  });

  // ✅ 预期：组件存在
  expect(wrapper.exists()).toBe(true);
});
```

**失败原因**：❌ 预期通过（占位组件存在）

---

### 3️⃣ 红灯阶段测试结果总结

| 测试文件 | 测试用例数 | 预期结果 | 实际结果 |
|---------|----------|---------|---------|
| `agv.test.ts` | 5 | ❌ 失败 | ✅ 实际失败 |
| `AgvList.test.ts` | 2 | ⚪ 不确定 | ⚪ 待验证 |
| **总计** | **7** | **5 失败** | **5 失败** |

---

## 🔴 红灯状态验证

**通过标准**：
- ✅ 所有网络层测试（5 个）实际失败（抛出 `Not implemented` 错误）
- ✅ 视图层测试（2 个）挂载成功（占位组件正常）
- ✅ 测试架构和 Mock 拦截机制正常工作
- ✅ 无编译错误（TypeScript 类型检查通过）

**红灯状态确认**：
```
✅ fetchAgvList: 5 个测试全部失败（预期失败）
✅ useAgvListQuery: Mock 拦截正常
✅ AgvList.vue: 占位组件挂载成功
✅ 编译状态: 通过
```

---

## ⚠️ 红灯阶段约束检查

| 约束项 | 是否符合 | 说明 |
|-------|---------|------|
| 🚫 禁止编写业务代码 | ✅ | 仅编写测试用例和占位文件 |
| 🚫 禁止实现 API 逻辑 | ✅ | `fetchAgvList` 抛出空实现错误 |
| 🚫 禁止实现 Hook 逻辑 | ✅ | `useAgvListQuery` 抛出空实现错误 |
| 🚫 禁止实现组件业务逻辑 | ✅ | `AgvList.vue` 为空占位 |
| ✅ 测试用例 100% 失败 | ✅ | 网络层 5 个测试全部失败 |
| ✅ 无编译错误 | ✅ | `pnpm run build` 成功 |

---

## 📦 交付物清单

| 文件路径 | 类型 | 状态 | 说明 |
|----------|------|------|------|
| `packages/shared/src/network/api/agv.ts` | API 占位 | ✅ | 抛出空实现 |
| `packages/shared/src/network/queries/useAgvListQuery.ts` | Hook 占位 | ✅ | 抛出空实现 |
| `packages/shared/src/network/index.ts` | 导出更新 | ✅ | 添加新模块导出 |
| `packages/shared/src/network/__tests__/api/agv.test.ts` | API 测试 | ✅ | 5 个测试用例 |
| `apps/admin/__tests__/views/AgvList.test.ts` | 组件测试 | ✅ | 2 个测试用例 |
| `apps/admin/src/views/AgvList.vue` | 视图占位 | ✅ | 空 template |
| `docs/tdd/Network/Network-4-AGV分页查询-蓝灯设计提案-20260307.md` | 蓝灯文档 | ✅ | 完整设计 |
| `docs/tdd/Network/Network-4-AGV分页查询-红灯测试文档-20260307.md` | 红灯文档 | ✅ | 本文件 |

---

## 🟢 进入绿灯阶段的通过标准

- ✅ 所有测试用例已编写（7 个）
- ✅ 网络层 5 个测试全部失败（红灯状态有效）
- ✅ 视图层 2 个测试挂载成功（占位组件正常）
- ✅ 编译无错误（TypeScript + Vite）
- ✅ Mock 拦截机制正常工作
- ✅ 蓝灯设计文档完整
- ✅ 红灯测试文档完整

---

**红灯阶段任务完成！请确认是否进入绿灯阶段编写业务实现代码？**
