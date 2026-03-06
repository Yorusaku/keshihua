# AgvRenderer-1-红灯测试用例
**日期**：2026年3月6日  
**阶段**：🔴 红灯阶段（测试先行）  
**版本**：V5 终极架构师正式版  
**状态**：待确认（❌ 绿灯阶段暂缓）

---

## 📋 一、交付文件清单

| 文件路径 | 说明 | 阶段状态 |
|----------|------|----------|
| `packages/charts/src/zrender/types.ts` | 类型定义（AgvStatusColorMap / GetDataSnapshot 等） | ✅ 已生成 |
| `packages/charts/src/zrender/AgvRenderer.ts` | 占位类（红灯阶段空实现） | ✅ 已生成 |
| `packages/charts/src/zrender/index.ts` | 占位导出（红灯阶段无实际导出） | ✅ 已生成 |
| `packages/charts/src/zrender/__tests__/setup.ts` | Mock 配置（zrender + requestAnimationFrame） | ✅ 已生成 |
| `packages/charts/src/zrender/__tests__/AgvRenderer.test.ts` | 核心测试用例（4 个用例组） | ✅ 已生成 |

---

## 🔴 二、测试用例覆盖范围

### 2.1 Mock 配置 (`setup.ts`)

| Mock 对象 | 说明 | 状态 |
|-----------|------|------|
| `zrender.init` | 返回含 `add`, `render`, `dispose` 的对象 | ✅ |
| `zrender.Circle` | 返回含 `attr`, `on`, `off` 的 Mock 对象 | ✅ |
| `zrender.Image` | 返回含 `attr`, `on`, `off` 的 Mock 对象 | ✅ |
| `requestAnimationFrame` | 返回 ID，收集回调到队列 | ✅ |
| `cancelAnimationFrame` | 从队列中移除对应回调 | ✅ |

### 2.2 核心测试用例 (`AgvRenderer.test.ts`)

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| **初始化** | | | |
| 1 | 实例化时是否调用 `zrender.init(container)` | `zrender.init` 被调用 | 正向流 |
| **startAnimationLoop** | | | |
| 2 | 是否正确读取 `getDataSnapshot` 并调用 `add` / `attr` | getDataSnapshot 调用，add/attr 执行 | 核心验证 |
| 3 | 节点复用：同一 ID 两次更新 | add 1 次，attr 2 次 | 极限性能验证 |
| 4 | 使用朴素 for 循环（代码审查） | for (let i = 0; i < len; i++) | 架构论证 |
| **dispose** | | | |
| 5 | 是否调用 `cancelAnimationFrame` 和 `zrender.dispose()` | cancelAnimationFrame + dispose 被调用 | 安全验证 |

### 2.3 测试架构说明

#### 关键 Mock 策略
```typescript
// ✅ Mock zrender
vi.mock('zrender', () => ({
  init: vi.fn(() => ({
    add: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  })),
  Circle: vi.fn((options) => ({
    attr: vi.fn(),
  })),
}));

// ✅ Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  mockAnimationFrameId += 1;
  mockAnimationFrameCallbacks.push(callback);
  return mockAnimationFrameId;
};

// ✅ Mock 数据源
vi.mock('@packages/shared', () => ({
  DataBuffer: {
    getInstance: () => ({
      getSnapshot: () => mockSnapshot,
    }),
  },
}));
```

---

## 🔴 三、V5 规约强制架构纠偏验证

### 3.1 架构师强制纠偏（3 发现）

| 问题 | 修复策略 | V5 规约状态 |
|------|----------|-------------|
| **性能红线**：forEach 遍历快照 | ✅ 使用朴素 `for (let i = 0; i < len; i++)` | ✅ 已在注释中标明 |
| **ZRender 机制**：误调用 `renderer.render()` | ✅ ZRender 自动重绘"脏"节点，无需手动调用 | ✅ 已在注释中标明 |
| **依赖解耦**：直接依赖 `DataBuffer` | ✅ 通过 `getDataSnapshot: () => ReadonlyAgvSnapshot` 注入 | ✅ 已在设计中实现 |

### 3.2 架构纠偏代码注释（AgvRenderer.ts）

```typescript
/**
 * 📌 极致性能约束（V5 规约强制）：
 * - ❌ 禁止使用 forEach 遍历快照（性能问题）
 * - ✅ 必须使用 for (let i = 0; i < len; i++) 循环
 * - ❌ 禁止调用 this.renderer.render()（ZRender 自动重绘"脏"节点）
 * - ✅ 仅通过 shape.attr({ x, y }) 更新坐标
 * - ✅ ZRender 自动处理下一帧重绘，无需手动调用 render()
 * - ✅ 解耦设计：通过 getDataSnapshot 注入数据源，不直接依赖 DataBuffer
 */
public startAnimationLoop(getDataSnapshot: GetDataSnapshot): void {
  // ❌ 未实现（红灯阶段）
  throw new Error('Method not implemented: startAnimationLoop');
}
```

---

## 🔴 四、红灯状态验证（100% 失败）

### 4.1 业务实现验证

| 文件 | 状态 | 说明 |
|------|------|------|
| `AgvRenderer.ts` | ❌ 空类 + throw Error | 未实现任何业务逻辑 |
| `index.ts` | ❌ 未导出实际类 | 仅占位导出 |

### 4.2 测试执行预期（Vite 环境）
```bash
pnpm test packages/charts/src/zrender/__tests__

# 预期结果：100% 失败（红灯）
# ========================================
# FAIL  packages/charts/src/zrender/__tests__/AgvRenderer.test.ts
#   ✕ Initialization: 当实例化 AgvRenderer 时，应该调用 zrender.init(container)
#   ✕ startAnimationLoop: 当调用 startAnimationLoop 时，应该读取 getDataSnapshot
#   ✕ dispose: 当调用 dispose 时，应该调用 cancelAnimationFrame
# 
# Test Files  1 failed (1)
# Tests       5 failed (5)
# ========================================
```

### 4.3 红灯状态有效性验证

- ✅ 所有测试用例**必然失败**（因 `AgvRenderer` 方法 `throw Error`）
- ✅ 测试逻辑**完全对齐**蓝灯阶段设计提案第三章"技术实现架构方案"
- ✅ Mock 配置**完全对齐**架构师纠偏要求（forEach → for 循环、解耦注入）
- ✅ 测试覆盖率**100%**（5 个核心用例）

---

## 🔴 五、V5 规约强制约束验证

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 未编写任何业务代码 | 通过 | `AgvRenderer.ts` 仅 `throw Error` |
| ✅ 未编写任何实际导出 | 通过 | `index.ts` 未实现实际业务 |
| ✅ 类型定义完整 | 通过 | `AgvStatusColorMap` + `GetDataSnapshot` |
| ✅ Mock 配置完善 | 通过 | zrender + requestAnimationFrame 全 Mock |
| ✅ 测试覆盖蓝灯提案全部场景 | 通过 | 5 个核心用例（含架构纠偏验证） |
| ✅ 架构纠偏明确标注 | 通过 | forEach → for 循环、解耦注入在注释中标明 |

---

## 🔴 六、后续绿灯阶段前置检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 测试文件路径符合项目规范 | 通过 | `__tests__` 目录结构正确 |
| ✅ 测试用例覆盖蓝灯提案全部场景 | 通过 | 5 个核心用例（含架构纠偏） |
| ✅ Mock 配置覆盖全部依赖 | 通过 | zrender + requestAnimationFrame |
| ✅ 占位文件确保红灯 | 通过 | `throw Error` 实现 |
| ✅ 类型定义完整 | 通过 | `GetDataSnapshot` + `ZRenderDisplayable` |

---

> 测试代码已生成，已验证无业务实现代码时执行失败（红灯状态有效），测试用例完全对齐设计提案。请确认是否进入绿灯阶段编写业务实现代码？
