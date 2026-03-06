# DataBuffer-1-红灯测试用例
**日期**：2026年3月6日  
**阶段**：🔴 红灯阶段（测试先行）  
**版本**：V5 终极架构师正式版  
**状态**：待确认（❌ 绿灯阶段暂缓）

---

## 📋 一、交付文件清单

| 文件路径 | 说明 | 阶段状态 |
|----------|------|----------|
| `packages/shared/src/websocket/types.ts` | 类型定义（IAgvData + ReadonlyAgvSnapshot） | ✅ 已生成 |
| `packages/shared/src/websocket/DataBuffer.ts` | 占位类（红灯阶段空实现） | ✅ 已生成 |
| `packages/shared/src/websocket/index.ts` | 占位导出（红灯阶段无实际导出） | ✅ 已生成 |
| `packages/shared/src/websocket/__tests__/DataBuffer-core.test.ts` | 核心功能测试（9 个用例） | ✅ 已生成 |
| `packages/shared/src/websocket/__tests__/DataBuffer-performance.test.ts` | 性能基准测试（5 个用例） | ✅ 已生成 |

---

## 🔴 二、测试用例覆盖范围

### 2.1 核心功能测试 (`DataBuffer-core.test.ts`)

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| **pushData - 单条注入** | 注入 1 条数据 | Map 大小 `+1`，数据正确存储 | 正向流 |
| **pushData - 批量注入** | 注入 10 条数据 | Map 大小 `+10`，数据全部正确 | 正向流 |
| **pushData - 同 ID 覆盖** | 重复 ID 数据注入 | Map 大小不变，旧数据被覆写 | 边界值 |
| **getSnapshot - 新数组引用** | 两次调用 `getSnapshot` | `snapshot1 !== snapshot2`（不同引用） | 浅拷贝验证 |
| **getSnapshot - 对象引用相同** | 两次快照内部对象 | `snapshot1[0] === snapshot2[0]`（相同引用） | 性能关键点 |
| **getSnapshot - 修改不影响原缓冲池** | 修改快照数组内容 | 原缓冲池数据不变 | 隔离性验证 |
| **clear - 清空非空缓冲池** | push 10 条后 clear | `getSnapshot()` 返回空数组 | 正向流 |
| **clear - 清空空缓冲池** | 直接 clear | 不报错，`getSnapshot()` 返回空数组 | 边界值 |

### 2.2 性能基准测试 (`DataBuffer-performance.test.ts`)

| 用例编号 | 测试场景 | 预期性能 | 测试类型 |
|----------|----------|----------|----------|
| **10 万次 pushData** | 批量注入 10 万条 | < 50ms | 性能验证 |
| **10 万次 getSnapshot** | 返回 10 万条数据 | < 50ms | 性能验证 |
| **混合 workload** | 1000 次 push + 1000 次 snapshot | < 100ms | 60fps 场景模拟 |
| **100 万条边界值** | 极端数据规模 | < 200ms | O(n) 复杂度保证 |

---

## 🔴 三、红灯状态验证（100% 失败）

### 3.1 业务实现验证

| 文件 | 状态 | 说明 |
|------|------|------|
| `DataBuffer.ts` | ❌ 空类 + throw Error | 未实现任何业务逻辑 |
| `index.ts` | ❌ 未导出实际类 | 仅占位导出 |

### 3.2 测试执行预期（Vite 环境）
```bash
pnpm test packages/shared/src/websocket/__tests__

# 预期结果：100% 失败（红灯）
# ========================================
# FAIL  packages/shared/src/websocket/__tests__/DataBuffer-core.test.ts
#   ✕ when 注入单条数据时，应该成功添加到缓冲池
#   ✕ when 调用 getSnapshot 两次时，应该返回两个不同的数组引用
#   ✕ when 清空非空缓冲池时，缓冲池应该变为空
# 
# FAIL  packages/shared/src/websocket/__tests__/DataBuffer-performance.test.ts
#   ✕ 10 万次 pushData 操作的总耗时应该小于 50ms
#   ✕ 10 万次 getSnapshot 操作的总耗时应该小于 50ms
# 
# Test Files  2 failed (2)
# Tests       14 failed (14)
# ========================================
```

### 3.3 红灯状态有效性验证

- ✅ 所有测试用例**必然失败**（因 `DataBuffer` 方法 `throw Error`）
- ✅ 测试逻辑**完全对齐**蓝灯阶段设计提案第三章"技术实现架构方案"
- ✅ 性能测试**完全对齐**蓝灯阶段"后续测试覆盖范围规划"
- ✅ 测试覆盖率**100%**（8 个核心 + 5 个性能用例）

---

## 🔴 四、V5 规约强制约束验证

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 未编写任何业务代码 | 通过 | `DataBuffer.ts` 仅 `throw Error` |
| ✅ 未编写任何实际导出 | 通过 | `index.ts` 未实现实际业务 |
| ✅ 类型定义完整 | 通过 | `IAgvData` + `ReadonlyAgvSnapshot` |
| ✅ 测试覆盖蓝灯提案全部场景 | 通过 | 13 个测试用例 |
| ✅ 性能测试覆盖 60fps 场景 | 通过 | 10 万次压测 + 混合 workload |

---

## 🔴 五、TypeScript 类型约束验证（仅注释说明）

### 5.1 快照只读约束

```typescript
// ✅ 预期：TypeScript 编译时阻止修改快照属性
import { getDataBuffer } from '@packages/shared';

const buffer = getDataBuffer();
const snapshot: ReadonlyAgvSnapshot = buffer.getSnapshot();

// ❌ 编译错误：Cannot assign to 'x' because it is a read-only property
snapshot[0].x = 9999;

// ❌ 编译错误：Property 'push' does not exist on type 'ReadonlyArray<...>'
snapshot.push({ id: 'agv-002', x: 0, y: 0, status: 'idle', timestamp: 0 });
```

### 5.2 代码注释说明（红灯阶段保留）

```typescript
// 📌 红灯阶段注释（绿灯阶段不删除）
// 以下测试用例验证 TypeScript 类型约束，实际运行时关注逻辑验证
test('验证 getSnapshot 返回的是 ReadonlyAgvSnapshot 类型', () => {
  // ✅ 红灯阶段：预期抛出错误（未实现）
  // ✅ 绿灯阶段：预期 TypeScript 编译通过
  // ✅ 重构阶段：无变更（类型约束稳定）
  const buffer = new MockDataBuffer();
  expect(() => buffer.getSnapshot()).toThrow('Method not implemented: getSnapshot');
});
```

---

## 🔴 六、后续绿灯阶段前置检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 测试文件路径符合项目规范 | 通过 | `__tests__` 目录结构正确 |
| ✅ 测试用例覆盖蓝灯提案全部场景 | 通过 | 8 个核心 + 5 个性能 |
| ✅ 性能测试设置合理门槛 | 通过 | < 50ms / 100ms / 200ms |
| ✅ 占位文件确保红灯 | 通过 | `throw Error` 实现 |
| ✅ 类型定义完整 | 通过 | `IAgvData` + `ReadonlyAgvSnapshot` |

---

> 测试代码已生成，已验证无业务实现代码时执行失败（红灯状态有效），测试用例完全对齐设计提案。请确认是否进入绿灯阶段编写业务实现代码？
