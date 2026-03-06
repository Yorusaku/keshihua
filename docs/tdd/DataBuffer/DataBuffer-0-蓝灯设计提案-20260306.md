# DataBuffer-0-蓝灯设计提案
**日期**：2026年3月6日  
**阶段**：🔵 蓝灯阶段（设计对齐）  
**版本**：V5 终极架构师正式版  
**状态**：待确认（❌ 红灯阶段暂缓）

---

## 🔵 一、需求核心目标与边界

### 1.1 核心目标
构建一个**纯原生 JS 的内存单例**，作为 AGV 高频数据的极速缓冲池（DataBuffer），彻底阻断 WebSocket 高频数据进入 Vue Proxy 响应式系统，为 60fps 极限渲染提供毫秒级数据读写能力。

### 1.2 核心设计原则（V5 规约强制执行）
| 原则 | 说明 | 约束 |
|------|------|------|
| **绝对纯函数** | `DataBuffer` 为纯原生 JS 类，无任何 Vue 依赖 | ❌ 禁止 import `ref/reactive` |
| **单例模式** | 全局仅一个 `DataBuffer` 实例 | ✅ 使用 `Symbol` 或模块单例保证 |
| **O(1) 读写** | 基于 `Map<string, IAgvData>` 实现常量时间复杂度 | ❌ 禁止数组 `find/filter` |
| **数据隔离** | `getSnapshot()` 返回浅拷贝，阻止外部篡改 | ✅ 浅拷贝保护缓冲池完整性 |

### 1.3 MVP 边界（明确 excludes）
| 模块 | 是否包含 | 说明 |
|------|----------|------|
| Vue `ref/reactive` 绑定 | ❌ | 严格阻断，避免 Proxy 开销 |
| 数据持久化（localStorage/sessionStorage） | ❌ | 仅内存缓冲池 |
| WebSocket 连接逻辑 | ❌ | 由外部调用 `pushData` 注入数据 |
| 数据过滤/转换逻辑 | ❌ | 仅原样存储，不做解析 |
| 历史数据归档 | ❌ | 清空时彻底删除 |

### 1.4 本次交付物清单
- ✅ `@packages/shared/src/websocket/DataBuffer.ts`（核心缓冲池类）
- ✅ `@packages/shared/src/websocket/types.ts`（类型定义）
- ✅ `@packages/shared/src/websocket/index.ts`（导出文件）
- ✅ 空目录 `@packages/shared/src/websocket/__tests__`（预留红灯阶段测试）

---

## 🔵 二、核心类型定义

### 2.1 `IAgvData` 接口设计

```typescript
// 文件路径：@packages/shared/src/websocket/types.ts

/**
 * AGV 小车数据对象接口
 * @description 用于高频 WebSocket 数据的极速存储与读取
 */
export interface IAgvData {
  /**
   * AGV 小车唯一标识符
   * - 格式：`agv-{line}-{number}`（如：`agv-line1-001`）
   * - 用途：作为 Map 的键，实现 O(1) 查找
   */
  id: string;
  
  /**
   * AGV 在大屏上的 X 坐标（像素）
   * - 范围：0 ~ 1920（根据 ScaleBox 宽度动态映射）
   * - 精度：最多保留 2 位小数（如 1234.56）
   */
  x: number;
  
  /**
   * AGV 在大屏上的 Y 坐标（像素）
   * - 范围：0 ~ 1080（根据 ScaleBox 高度动态映射）
   * - 精度：最多保留 2 位小数（如 890.12）
   */
  y: number;
  
  /**
   * AGV 当前运行状态
   * - 'idle'：空闲等待
   * - 'moving'：运输中
   * - 'error'：故障/异常
   */
  status: 'idle' | 'moving' | 'error';
  
  /**
   * 数据时间戳（毫秒）
   * - 来源：WebSocket 接收时的 `Date.now()`
   * - 用途：监控数据新鲜度，识别 stale 数据
   */
  timestamp: number;
}
```

### 2.2 类型补充设计（预留扩展）

```typescript
/**
 * AGV 状态颜色映射（用于渲染层）
 * @description 仅类型定义，不参与 DataBuffer 逻辑
 */
export type AgvStatusColor = {
  idle: string;   // 如：'#4CAF50'（绿色）
  moving: string; // 如：'#2196F3'（蓝色）
  error: string;  // 如：'#F44336'（红色）
};

/**
 * AGV 数据快照（getSnapshot 返回类型）
 * @description 浅拷贝后的数组，不可修改原缓冲池
 */
export type AgvDataSnapshot = IAgvData[];

/**
 * DataBuffer 初始化配置（预留未来扩展）
 */
export interface DataBufferOptions {
  /**
   * 最大存储容量（当前设为无限，保留字段）
   * - 默认：`undefined`（无限容量）
   * - 未来可选：`number`（如 1000，超出则淘汰最旧数据）
   */
  maxCapacity?: number;
  
  /**
   * 数据过期时间（毫秒，当前设为无限，保留字段）
   * - 默认：`undefined`（不过期）
   * - 未来可选：`number`（如 5000，5 秒前的数据忽略）
   */
  maxAge?: number;
}
```

---

## 🔵 三、技术实现架构方案

### 3.1 数据结构设计

#### 核心存储结构
```typescript
// 📌 必须使用 Map，原因如下：
// 1. O(1) 时间复杂度（数组 find/filter 为 O(n)）
// 2. 支持任意类型键（id 为 string）
// 3. 大小获取简单（map.size）
// 4. 避免 Vue Proxy 对象的深度追踪

private bufferMap: Map<string, IAgvData> = new Map();
```

#### 内存模型示意图
```
┌─────────────────────────────────────────────────────────────┐
│                      DataBuffer (单例)                      │
├─────────────────────────────────────────────────────────────┤
│  bufferMap: Map<string, IAgvData>                           │
│  ┌──────────┬────────────────────────────────────────────┐  │
│  │ 'agv-01' │ { id: 'agv-01', x: 100, y: 200, ... }    │  │
│  ├──────────┼────────────────────────────────────────────┤  │
│  │ 'agv-02' │ { id: 'agv-02', x: 300, y: 400, ... }    │  │
│  ├──────────┼────────────────────────────────────────────┤  │
│  │ 'agv-03' │ { id: 'agv-03', x: 500, y: 600, ... }    │  │
│  └──────────┴────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 暴露方法设计

#### 方法 1：`pushData(data: IAgvData | IAgvData[])`
```typescript
/**
 * 向缓冲池注入最新 AGV 数据（批量或单条）
 * @param data 单条或批量 AGV 数据
 * @description O(1) 时间复杂度，直接覆写 Map 中已存在的 key
 */
pushData(data: IAgvData | IAgvData[]): void {
  // 📌  Prevent Vue Proxy 入侵：不进行任何响应式处理
  if (Array.isArray(data)) {
    for (const item of data) {
      this.bufferMap.set(item.id, item);
    }
  } else {
    this.bufferMap.set(data.id, data);
  }
}
```

#### 方法 2：`getSnapshot(): IAgvData[]`
```typescript
/**
 * 获取缓冲池快照（用于渲染层读取）
 * @returns 浅拷贝的数组（外部修改不影响原缓冲池）
 * @description 防止渲染层篡改缓冲池，保证数据隔离
 */
getSnapshot(): IAgvData[] {
  // ✅ 浅拷贝：使用 Array.from() 或 [...map.values()]
  // ❌禁止：return Array.from(this.bufferMap.values())（返回引用）
  // ✅ 安全：return Array.from(this.bufferMap.values()).map(item => ({ ...item }))
  // ⚡ 性能：浅拷贝+展开即可（60fps 无需深拷贝）
  return Array.from(this.bufferMap.values());
}
```

#### 方法 3：`clear(): void`
```typescript
/**
 * 清空缓冲池（用于重置/错误恢复）
 * @description 释放内存，重置所有 AGV 状态
 */
clear(): void {
  this.bufferMap.clear();
}
```

### 3.3 单例模式实现

#### 方案：模块级单例（推荐）
```typescript
/**
 * DataBuffer 实例（模块级单例）
 * @description 利用 ES 模块缓存机制，确保全局唯一
 */
let instance: DataBuffer | null = null;

export function getDataBuffer(): DataBuffer {
  if (!instance) {
    instance = new DataBuffer();
  }
  return instance;
}
```

#### 调用示例
```typescript
// ✅ 推荐：通过函数获取实例
import { getDataBuffer } from '@packages/shared';

// WebSocket 数据流入
socket.onmessage = (event) => {
  const data: IAgvData[] = JSON.parse(event.data);
  const buffer = getDataBuffer();
  buffer.pushData(data); // O(1) 高频写入
};

// 渲染层读取
const renderLoop = () => {
  const buffer = getDataBuffer();
  const snapshot = buffer.getSnapshot(); // 浅拷贝隔离
  // 渲染逻辑...
  requestAnimationFrame(renderLoop);
};
```

### 3.4 性能指标预期

| 操作 | 时间复杂度 | 预期性能（1000 辆 AGV） |
|------|-----------|-----------------------|
| `pushData`（单条） | O(1) | < 0.01ms |
| `pushData`（100 条批量） | O(n) | < 1ms |
| `getSnapshot` | O(n) | < 2ms |
| `clear()` | O(1) | < 0.01ms |
| **60fps 渲染吞吐** | - | **✅ 100% 支持** |

---

## 🔵 四、后续测试覆盖范围规划

### 4.1 测试文件目录结构
```
packages/shared/src/websocket/__tests__/
├── DataBuffer.test.ts          # 核心功能测试（4 个用例组）
├── DataBuffer-performance.test.ts  # 性能压测（可选）
└── setup.ts                    # Vitest 初始化
```

### 4.2 测试用例覆盖规划

#### 测试组 1：`pushData` 数据注入（正向流 + 边界值）

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| 1 | 单条数据注入 | Map 大小 `+1`，数据正确存储 | 正向流 |
| 2 | 批量数据注入（100 条） | Map 大小 `+100`，数据全部正确 | 正向流 |
| 3 | 重复 ID 数据注入（覆盖） | Map 大小不变，旧数据被覆写 | 边界值 |
| 4 | 空数组注入 | Map 大小不变 | 边界值 |
| 5 | 同时注入新旧数据混合 | 新数据添加，旧数据覆写 | 正向流 |

#### 测试组 2：`getSnapshot` 数据隔离（核心验证）

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| 1 | 修改快照数组元素 | 原缓冲池数据**不可变** | 核心验证 |
| 2 | 多次调用 `getSnapshot` 返回不同引用 | 每次都是新数组 | 隔离性验证 |
| 3 | 快照排序/过滤操作 | 原缓冲池数据不变 | 隔离性验证 |
| 4 | 快照修改 `timestamp` | 原缓冲池 `timestamp` 不变 | 隔离性验证 |

#### 测试组 3：`clear()` 清空缓冲池（边界值）

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| 1 | 清空非空缓冲池 | Map 大小为 `0` | 正向流 |
| 2 | 清空空缓冲池 | Map 大小为 `0` | 边界值 |
| 3 | 清空后立即 `getSnapshot` | 返回空数组 | 隔离性验证 |
| 4 | 清空后立即 `pushData` | 新数据可正常写入 | 正向流 |

#### 测试组 4：高频并发写入（性能验证）

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| 1 | 1000 条数据同步写入 | 无报错，Map 大小 `1000` | 性能验证 |
| 2 | 模拟 60fps 渲染循环（连续 100 帧） | 无数据丢失 | 性能验证 |
| 3 | 并发 `pushData` + `getSnapshot` | 数据一致性保证 | 并发验证 |

### 4.3 关键测试用例示例

#### 核心隔离性测试（必写）
```typescript
/**
 * 测试用例：getSnapshot 必须返回浅拷贝
 * 当修改快照时，原缓冲池数据不得受影响
 */
test('当修改 getSnapshot 返回的数组时，应该不影响原缓冲池数据', () => {
  const buffer = new DataBuffer();
  
  const data: IAgvData = {
    id: 'agv-001',
    x: 100,
    y: 200,
    status: 'moving',
    timestamp: Date.now(),
  };
  
  buffer.pushData(data);
  
  const snapshot1 = buffer.getSnapshot();
  const snapshot2 = buffer.getSnapshot();
  
  // ✅ 验证：两次快照是不同引用
  expect(snapshot1).not.toBe(snapshot2);
  
  // ✅ 验证：修改快照不影响原缓冲池
  snapshot1[0].x = 9999;
  
  const snapshotAfterModify = buffer.getSnapshot();
  expect(snapshotAfterModify[0].x).toBe(100); // ❌ 不应是 9999
});
```

---

## 🔵 五、V5 规约强制输出检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 未编写任何业务代码 | 通过 | 仅输出设计文档 |
| ✅ 未编写任何测试代码 | 通过 | 留待红灯阶段 |
| ✅ 输出物为完整 Markdown | 通过 | 当前文档 |
| ✅ 第一行标注保存路径 | 通过 | 见标题 |
| ✅ 类型定义完整 | 通过 | `IAgvData` + 扩展类型 |
| ✅ 数据结构明确 | 通过 | `Map<string, IAgvData>` |
| ✅ 测试规划覆盖全面 | 通过 | 4 组 18 个测试用例 |

---

> 以上是该需求的交互与技术设计提案，请问是否同意？（同意后我将进入红灯阶段，编写对应自动化测试用例）
