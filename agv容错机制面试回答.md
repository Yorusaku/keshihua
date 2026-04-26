### Q: AGV 渲染崩溃的容错机制与异常数据复现方案

#### 1. 问题背景与挑战

线上运行时，某个特定的 AGV 坐标数据出现异常（NaN 或极大值），导致渲染循环抛出 JS Error，整个 Canvas 渲染崩溃。

这个问题的严重性在于：
- **影响范围大**：AGV 渲染是大屏的核心功能，崩溃后整个可视化大屏失去意义
- **难以复现**：异常数据是随机出现的，用户不会截图，无法直接看到崩溃时的状态
- **24 小时运行要求**：工业平板电脑需要不间断运行，不能因为单个异常数据导致系统整体崩溃

#### 2. 技术方案与设计

我设计了**三层防护机制**，从数据写入、渲染执行、全局捕获三个层面确保系统的容错能力：

**第一层：数据写入层防护**

在 DataBuffer 的 `pushData` 方法中，增加坐标有效性校验。当异常数据试图写入缓冲池时，直接拦截并跳过：

- 校验 x/y 是否为有效数字（排除 NaN、Infinity）
- 校验坐标是否在合理范围内（大屏尺寸 1920x1080，预留一定余量）
- 拦截时打印 warn 日志，不影响后续数据写入

**第二层：渲染层防护**

在 AgvRenderer 的 `renderLoop` 中，用 try-catch 包裹整个渲染逻辑：

- 渲染前二次校验（防御性编程，双重保险）
- 捕获异常后立即停止渲染循环，防止持续崩溃
- 调用 `monitor.reportError` 上报错误，附带当前帧的快照数据

**第三层：全局错误捕获**

在 Dashboard.vue 中监听 window.error 事件：

- 捕获 rAF 内部未处理的错误
- 上报到 monitor，补充错误上下文
- 记录错误发生时的 DataBuffer 快照，方便后续分析

#### 3. 核心实现与细节

**关键变量与函数**：

- `isValidCoordinate(data: IAgvData)`：坐标有效性校验函数
- `renderLoop`：渲染循环主体，包裹 try-catch
- `handleError(error)`：错误处理与上报函数
- `monitor.reportError`：调用 monitor SDK 的手动上报方法

**快照数据通过 monitor 的 custom 字段上报**：

```typescript
monitor.reportError(error, {
  category: 'agv-renderer',
  details: 'AGV 渲染循环异常',
  metadata: {
    snapshotSize: lastSnapshot.length,
    lastFrameData: lastSnapshot.slice(0, 10),
    timestamp: Date.now(),
  }
});
```

在监控后台就能看到具体是哪条数据导致了崩溃，比如：
```json
{
  "category": "agv-renderer",
  "metadata": {
    "lastFrameData": [
      {"id": "agv-mock-042", "x": NaN, "y": 1234567890123, "status": "moving"}
    ]
  }
}
```

**额外的监控手段**：

- 性能监控：用 monitor 的 performance 插件采集 FCP 指标，每帧耗时超过 30ms 自动告警
- 异常计数器：在 DataBuffer 中维护一个异常计数器，每拦截 100 次无效数据就上报一次摘要
- 日志聚合：配合 ELK，收集所有 console.warn/error，按模块过滤

#### 4. 工程闭环与收益

**容错能力**：

- 即使出现异常数据，系统也不会崩溃，而是跳过异常数据继续运行
- 渲染循环捕获异常后，可以尝试恢复（比如清空 DataBuffer 重新开始）

**监控能力**：

- monitor 不仅上报错误堆栈，还附带快照数据，方便复现问题
- 配合 ELK 日志聚合，可以按模块过滤所有 console.warn/error

**实际收益**：

- 系统稳定性：24 小时不间断运行，不会因为单个异常数据崩溃
- 问题排查：通过 monitor + 日志，可以快速定位问题数据
- 用户体验：即使个别 AGV 数据异常，也不会影响其他 AGV 的正常渲染
