/**
 * DataBuffer 导出文件
 * 文件路径：@packages/shared/src/websocket/index.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 导出说明：
 * - DataBuffer：核心缓冲池类（单例模式）
 * - getInstance：静态方法获取单例实例（推荐使用）
 * - IAgvData：AGV 数据类型
 * - ReadonlyAgvSnapshot：只读快照类型（TypeScript 静态约束）
 * - AgvSyncBus：跨端通信总线
 * - AGV_SYNC_CHANNEL：广播频道常量
 * - agvSyncBus：总线单例实例
 * - MonitorableWebSocket：监控后的 WebSocket 类（任务二）
 * - monitorWebSocket：便捷函数，创建监控后的 WebSocket 实例
 *
 * 🔄 调用方式变更：
 * - 之前：getDataBuffer().pushData(data)
 * - 现在：DataBuffer.getInstance().pushData(data)（OOP 语义更清晰）
 */

// ✅ 核心类与方法导出
export { DataBuffer } from './DataBuffer';

// ✅ 类型导出
export type { IAgvData, ReadonlyAgvSnapshot } from './types';

// ✅ 跨端通信总线导出（类型）
export type { AgvSyncBus } from './AgvSyncBus';

// ✅ 常量与实例导出
export { AGV_SYNC_CHANNEL, agvSyncBus } from './AgvSyncBus';

// ✅ WebSocket 监控工具导出（任务二）
export { MonitorableWebSocket } from './_monitorUtils';

// 📌 调用示例（生产环境）：
// import { DataBuffer, IAgvData, agvSyncBus, MonitorableWebSocket } from '@packages/shared';
// DataBuffer.getInstance().pushData(data);
// agvSyncBus.broadcastNewAgv(newAgvData);
// 
// // 任务二：WebSocket 监控
// const ws = new MonitorableWebSocket('ws://localhost:8080', reporter, {
//   withStack: false,
// });
// ws.send('hello');
// ws.close();
