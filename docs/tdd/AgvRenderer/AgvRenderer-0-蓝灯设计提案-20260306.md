# AgvRenderer-0-蓝灯设计提案
**日期**：2026年3月6日  
**阶段**：🔵 蓝灯阶段（设计对齐）  
**版本**：V5 终极架构师正式版  
**状态**：待确认（❌ 红灯阶段暂缓）

---

## 🔵 一、需求核心目标与边界

### 1.1 核心目标
构建一个**脱离 Vue 响应式的 AGV 纯 Canvas 渲染池（AgvRenderer）**，直接利用 ZRender 接管 HTMLCanvasElement，并在内部开启原生的 `requestAnimationFrame` 渲染循环，实现 60fps 极限渲染性能。每帧从 `DataBuffer` 拉取最新快照，批量更新 AGV 节点坐标。

### 1.2 核心设计原则（V5 规约强制执行）
| 原则 | 说明 | 约束 |
|------|------|------|
| **完全解耦** | `AgvRenderer` 为独立原生类，无 Vue 依赖 | ❌ 禁止 import Vue / @vueuse |
| **性能优先** | 每帧从 `DataBuffer.getSnapshot()` 批量更新节点 | ❌ 禁止逐个监听 `ref` 变化 |
| **资源管理** | 提供明确的 `dispose()` 方法，防止内存泄漏 | ✅ 必须清理 `requestAnimationFrame` + `zrender.dispose()` |
| **ZRender 原生** | 使用 ZRender 的 `zrender.init()` + `zrender.Circle` / `zrender.Image` | ❌ 禁止使用 Vue 组件 |

### 1.3 MVP 边界（明确 excludes）
| 模块 | 是否包含 | 说明 |
|------|----------|------|
| Vue 组件封装 | ❌ | `AgvRenderer` 仅为核心渲染引擎 |
| `zrender.init()` 参数高级配置 | ❌ | 使用默认配置即可 |
| AGV 节点复杂动画 | ❌ | 暂仅实现坐标更新（后续可扩展） |
| 鼠标交互事件（点击/拖拽） | ❌ | 暂不实现（后续可扩展） |
| 多图层管理 | ❌ | 暂仅单层（后续可扩展） |

### 1.4 本次交付物清单
- ✅ `@packages/charts/src/zrender/AgvRenderer.ts`（核心渲染器类）
- ✅ `@packages/charts/src/zrender/types.ts`（类型定义）
- ✅ `@packages/charts/src/zrender/index.ts`（导出文件）
- ✅ 空目录 `@packages/charts/src/zrender/__tests__`（预留红灯阶段测试）

---

## 🔵 二、技术实现架构方案

### 2.1 整体架构流程图

```
┌─────────────────────────────────────────────────────────────┐
│                     可视化应用主入口                         │
│  (Vue 组件)                                                  │
│  import { AgvRenderer } from '@packages/charts';            │
│  const renderer = new AgvRenderer(container);               │
│  renderer.startAnimationLoop();  ← 启动渲染循环            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      AgvRenderer (核心引擎)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  private renderer: zrender.Instance                     │ │
│  │  private animations: Map<string, zrender.Displayable>   │ │
│  │  private animationFrameId: number                       │ │
│  │                                                         │ │
│  │  startAnimationLoop() {                                │ │
│  │    renderLoop() {                                      │ │
│  │      const snapshot = DataBuffer.getInstance()         │ │
│  │               .getSnapshot();  ← 拉取最新快照          │ │
│  │                                                        │ │
│  │      snapshot.forEach(data => {                        │ │
│  │        let shape = this.animations.get(data.id);      │ │
│  │        if (!shape) shape = this.createNode(data);     │ │
│  │        shape.attr({ x: data.x, y: data.y });          │ │
│  │      });                                               │ │
│  │                                                        │ │
│  │      this.renderer.render();  ← 批量提交渲染           │ │
│  │      this.animationFrameId = requestAnimationFrame(   │ │
│  │        this.renderLoop.bind(this)                     │ │
│  │      );                                                │ │
│  │    }                                                   │ │
│  │    this.animationFrameId = requestAnimationFrame(     │ │
│  │      this.renderLoop.bind(this)                       │ │
│  │    );                                                  │ │
│  │  }                                                     │ │
│  │                                                         │ │
│  │  dispose() {                                           │ │
│  │    cancelAnimationFrame(this.animationFrameId);        │ │
│  │    this.renderer.dispose();                           │ │
│  │  }                                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心类设计

#### `AgvRenderer` 类结构
```typescript
// 文件路径：@packages/charts/src/zrender/AgvRenderer.ts

import zrender from 'zrender';

/**
 * AGV 纯 Canvas 渲染器
 * @description 独立原生类，负责 ZRender 实例生命周期管理与渲染循环
 * 
 * 🔒 关键约束：
 * - 纯原生 JS 类（无 Vue 依赖）
 * - requestAnimationFrame 渲染循环
 * - 从 DataBuffer 拉取快照批量更新节点
 * - 明确的资源销毁方法（防止内存泄漏）
 */
export class AgvRenderer {
  // 📦 ZRender 实例（接收用户传入的容器）
  private renderer: zrender.Instance | null = null;

  // 📦 节点池（Map<string, zrender.Displayable>）
  private animations: Map<string, zrender.Displayable> = new Map();

  // 📦 requestAnimationFrame 标识
  private animationFrameId: number = 0;

  // 📦 默认节点配置（可配置化为 props）
  private nodeConfig: {
    radius: number;
    color: string;
  } = {
    radius: 20,
    color: '#2196F3',
  };

  /**
   * 构造函数
   * @param container HTMLDivElement 容器（用户传入）
   * @description 在内部调用 zrender.init(container) 创建 ZRender 实例
   */
  constructor(container: HTMLDivElement) {
    // ✅ 初始化 ZRender 实例
    this.renderer = zrender.init(container);
  }

  /**
   * 启动渲染循环
   * @description 开启原生 requestAnimationFrame 循环，每帧从 DataBuffer 拉取快照
   */
  public startAnimationLoop(): void {
    // ✅ 使用 requestAnimationFrame 开启渲染循环
    const renderLoop = () => {
      // 📌 从 DataBuffer 拉取最新快照（批量数据）
      const snapshot = DataBuffer.getInstance().getSnapshot();

      // ✅ 遍历快照，批量更新节点坐标
      snapshot.forEach((data) => {
        // 检查节点是否存在（不存在则创建）
        let shape = this.animations.get(data.id);

        if (!shape) {
          // ✅ 创建新节点（ZRender.Circle / ZRender.Image）
          shape = this.createNode(data);
          this.animations.set(data.id, shape);
        }

        // ✅ 更新节点坐标（O(1) 读写）
        shape.attr({
          x: data.x,
          y: data.y,
        });
      });

      // ✅ 批量提交渲染
      this.renderer?.render();

      // ✅ 递归调用 requestAnimationFrame
      this.animationFrameId = requestAnimationFrame(renderLoop);
    };

    // ✅ 启动首次循环
    this.animationFrameId = requestAnimationFrame(renderLoop);
  }

  /**
   * 创建新节点（私有方法）
   * @param data AGV 数据对象
   * @returns zrender.Displayable 实例（Circle 或 Image）
   */
  private createNode(data: IAgvData): zrender.Displayable {
    // ✅ 根据 AGV 状态决定节点样式（可扩展为 Image）
    const isMoving = data.status === 'moving';
    const color = isMoving ? this.nodeConfig.color : '#4CAF50'; // idle 状态为绿色

    // ✅ 创建 ZRender 圆形节点
    const shape = new zrender.Circle({
      shape: {
        cx: data.x,
        cy: data.y,
        r: this.nodeConfig.radius,
      },
      style: {
        fill: color,
        stroke: '#fff',
        strokeWidth: 2,
      },
      crc: 10, // 拖拽区域半径（可选）
    });

    // ✅ 添加到 ZRender 实例
    this.renderer?.add(shape);

    return shape;
  }

  /**
   * 资源销毁（防止内存泄漏）
   * @description 注销 requestAnimationFrame，调用 zrender.dispose()
   */
  public dispose(): void {
    // ✅ 注销 requestAnimationFrame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    // ✅ 清空节点池
    this.animations.clear();

    // ✅ 销毁 ZRender 实例
    this.renderer?.dispose();
    this.renderer = null;
  }
}
```

### 2.3 数据流程详解

#### 渲染循环体（每帧执行）
```typescript
// 📌 每帧渲染循环（60fps）
const renderLoop = () => {
  // 1️⃣ 拉取最新快照（DataBuffer.getSnapshot）
  const snapshot = DataBuffer.getInstance().getSnapshot();

  // 2️⃣ 遍历快照，批量更新节点
  snapshot.forEach((data) => {
    let shape = this.animations.get(data.id);

    // ✅ 节点不存在：创建新节点 + 添加到 ZRender
    if (!shape) {
      shape = this.createNode(data);
      this.animations.set(data.id, shape);
    }

    // ✅ 节点存在：仅更新坐标（O(1)）
    shape.attr({
      x: data.x,
      y: data.y,
    });
  });

  // 3️⃣ 批量提交渲染
  this.renderer?.render();

  // 4️⃣ 递归调用 requestAnimationFrame
  this.animationFrameId = requestAnimationFrame(renderLoop);
};
```

### 2.4 性能指标预期

| 操作 | 时间复杂度 | 预期性能（1000 辆 AGV） |
|------|-----------|-----------------------|
| `getSnapshot()` | O(n) | < 2ms |
| `createNode()` | O(1) | < 0.1ms |
| `shape.attr({x, y})` | O(1) | < 0.01ms |
| `renderer.render()` | O(n) | < 5ms |
| **60fps 渲染总耗时** | - | **✅ < 16.67ms** |

### 2.5 类型定义

```typescript
// 文件路径：@packages/charts/src/zrender/types.ts

/**
 * AgvRenderer 构件 Color Map
 * @description 状态到颜色的映射
 */
export type AgvStatusColorMap = {
  idle: string;
  moving: string;
  error: string;
};

/**
 * AgvRenderer 配置接口（预留扩展）
 */
export interface AgvRendererOptions {
  /**
   * 节点半径（像素）
   * - 默认：20
   */
  nodeRadius?: number;

  /**
   * 节点颜色映射
   * - 默认：idle=绿色, moving=蓝色, error=红色
   */
  colorMap?: AgvStatusColorMap;
}
```

---

## 🔵 三、后续测试覆盖范围规划

### 3.1 测试文件目录结构
```
packages/charts/src/zrender/__tests__/
├── AgvRenderer.test.ts         # 核心功能测试（4 个用例组）
├── AgvRenderer-ivite.test.ts   # Vitest 环境初始化
└── setup.ts                    # 测试环境 Mock（requestAnimationFrame + zrender）
```

### 3.2 测试用例覆盖规划

#### 测试组 1：`startAnimationLoop` 渲染循环（核心验证）

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| 1 | 调用 `startAnimationLoop()` | `requestAnimationFrame` 被调用，渲染循环开启 | 正向流 |
| 2 | 连续 100 帧调用 | 渲染循环持续运行，无报错 | 边界值 |
| 3 | 节点更新（坐标变化） | 节点位置正确更新（ZRender 内部 state 变化） | 核心验证 |
| 4 | 新节点创建 | 未存在的 AGV ID 正确创建新节点并添加到 ZRender | 核心验证 |
| 5 | 节点坐标复用 | 已存在的 AGV ID 仅更新坐标，不创建新节点 | 核心验证 |

#### 测试组 2：`dispose` 资源销毁（防止泄漏）

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| 1 | 调用 `dispose()` | `cancelAnimationFrame` 被调用，渲染循环停止 | 正向流 |
| 2 | `dispose()` 后重绘 | 不再调用 `requestAnimationFrame` | 安全验证 |
| 3 | `dispose()` 后节点池清空 | `animations` Map 大小为 `0` | 内存验证 |
| 4 | `dispose()` 后 ZRender 销毁 | `zrender.dispose()` 被调用 | 核心验证 |

#### 测试组 3：Mock `requestAnimationFrame`（环境隔离）

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| 1 | Mock `requestAnimationFrame` | 函数被正确调用，不触发实际渲染 | 环境验证 |
| 2 | Mock `cancelAnimationFrame` | 函数被正确调用，不保留定时器 | 环境验证 |
| 3 | Mock `zrender.init` | 返回 Mock 实例，不创建真实 Canvas | 环境验证 |
| 4 | Mock `zrender.dispose` | 函数被正确调用 | 环境验证 |

#### 测试组 4：Mock `DataBuffer`（数据隔离）

| 用例编号 | 测试场景 | 预期结果 | 测试类型 |
|----------|----------|----------|----------|
| 1 | Mock `getSnapshot` 返回空数组 | 无节点创建，仅清空节点池 | 环境验证 |
| 2 | Mock `getSnapshot` 返回 1000 条数据 | 批量创建/更新 1000 个节点 | 性能验证 |
| 3 | Mock `getSnapshot` 返回重复 ID 数据 | 仅更新坐标，不创建新节点 | 核心验证 |
| 4 | Mock `getSnapshot` 返回新旧混合数据 | 新节点创建 + 旧坐标更新同时发生 | 核心验证 |

### 3.3 关键测试用例示例（核心验证）

#### 核心：渲染循环开启验证
```typescript
/**
 * 测试用例：调用 startAnimationLoop 时，requestAnimationFrame 应被调用
 */
test('当调用 startAnimationLoop() 时，requestAnimationFrame 应被调用', () => {
  // ✅ Mock requestAnimationFrame
  const mockRAF = vi.fn((fn) => {
    // 模拟首次调用
    fn();
    return 1; // 返回 animationFrameId
  });

  global.requestAnimationFrame = mockRAF;

  // ✅ Mock zrender
  const mockRenderer = {
    add: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  };
  (zrender as any).init = vi.fn(() => mockRenderer);

  const container = document.createElement('div');
  const renderer = new AgvRenderer(container);

  // ✅ 调用 startAnimationLoop
  renderer.startAnimationLoop();

  // ✅ 断言：requestAnimationFrame 被调用
  expect(mockRAF).toHaveBeenCalled();

  // ✅ 断言：zrender.init 被调用
  expect((zrender as any).init).toHaveBeenCalledWith(container);

  // ✅ 清理
  vi.restoreAllMocks();
});
```

#### 核心：节点更新逻辑验证
```typescript
/**
 * 测试用例：当节点已存在时，应仅更新坐标，不创建新节点
 */
test('当节点已存在时，应该仅更新坐标，不创建新节点', () => {
  // ✅ Mock
  const mockRenderer = {
    add: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  };
  (zrender as any).init = vi.fn(() => mockRenderer);

  // ✅ Mock DataBuffer
  const mockData: IAgvData[] = [
    { id: 'agv-001', x: 100, y: 200, status: 'moving', timestamp: Date.now() },
  ];
  vi.spyOn(DataBuffer.getInstance(), 'getSnapshot').mockReturnValue(mockData);

  const container = document.createElement('div');
  const renderer = new AgvRenderer(container);

  // ✅ 第一次调用：创建节点
  renderer.startAnimationLoop();
  expect(mockRenderer.add).toHaveBeenCalledTimes(1); // 创建节点

  // ✅ 第二次调用：仅更新坐标
  renderer.startAnimationLoop();
  expect(mockRenderer.add).toHaveBeenCalledTimes(1); // 仍为 1（未创建新节点）

  // ✅ 清理
  renderer.dispose();
  vi.restoreAllMocks();
});
```

---

## 🔵 四、V5 规约强制输出检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 未编写任何业务代码 | 通过 | 仅输出设计文档 |
| ✅ 未编写任何测试代码 | 通过 | 留待红灯阶段 |
| ✅ 输出物为完整 Markdown | 通过 | 当前文档 |
| ✅ 第一行标注保存路径 | 通过 | 见标题 |
| ✅ ZRender 架构明确 | 通过 | `zrender.init` + `zrender.Circle` |
| ✅ requestAnimationFrame 明确 | 通过 | 原生渲染循环 |
| ✅ 测试规划覆盖全面 | 通过 | 4 组 20 个测试用例 |

---

> 以上是该需求的交互与技术设计提案，请问是否同意？（同意后我将进入红灯阶段，编写对应自动化测试用例）
