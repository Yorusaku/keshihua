# 📦 WebSocket 模块

## 概述

本模块提供 WebSocket 相关的工具和封装，用于大屏场景下的实时数据通信。

### 核心组件

| 组件 | 说明 |
|------|------|
| `DataBuffer` | 高频数据缓冲池（O(1) 读写，防止 Vue 响应式系统性能瓶颈） |
| `AgvSyncBus` | 跨端通信总线（基于 BroadcastChannel API） |
| `MonitorableWebSocket` | 带监控的 WebSocket 类（自动捕获错误和断连） |

## MonitorableWebSocket（任务二：WebSocket 异常监控）

### 特性

- ✅ 自动捕获 `onerror` 事件
- ✅ 自动捕获 `onclose` 事件并判断异常断连
- ✅ 自动上报错误信息到 Monitor SDK
- ✅ 支持超时配置

### 使用示例

```typescript
import { MonitorableWebSocket } from '@packages/shared';
import { initMonitor } from '@packages/monitor';

// 1. 初始化 Monitor SDK
const monitorInstance = initMonitor({
  dsn: '/api/report',
  appId: 'dashboard',
  network: true,
  debug: import.meta.env.DEV,
});

// 2. 创建监控后的 WebSocket
const ws = new MonitorableWebSocket(
  'ws://localhost:8080/ws',
  monitorInstance // 传递 Monitor 实例
);

// 3. 监听 WebSocket 事件
ws.addEventListener('open', () => {
  console.log('WebSocket connected');
  ws.send(JSON.stringify({ type: 'heartbeat' }));
});

ws.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});

// 4. 异常断连监控（自动上报）
// 如果 WebSocket 非正常断连（wasClean = false），会自动上报详细信息：
// - 断连时间戳
// - close code
// - close reason
```

### 自定义上报

```typescript
// 如果需要更多自定义信息，可以通过 MonitorInstance.reportError

// 上报自定义错误
ws.addEventListener('error', (event) => {
  monitorInstance.reportError(event.error, {
    category: 'websocket-custom',
    details: '自定义错误描述',
    metadata: { wsUrl: ws.url, timestamp: Date.now() },
  });
});
```

## DataBuffer

高性能数据缓冲池，用于存储高频 WebSocket 数据，避免进入 Vue 响应式系统。

## AgvSyncBus

跨 Tab/窗口通信总线，基于 BroadcastChannel API。
