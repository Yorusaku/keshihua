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
 *
 * 🔄 调用方式变更：
 * - 之前：getDataBuffer().pushData(data)
 * - 现在：DataBuffer.getInstance().pushData(data)（OOP 语义更清晰）
 */
// ✅ 核心类与方法导出
export { DataBuffer } from './DataBuffer';
// 📌 调用示例（生产环境）：
// import { DataBuffer, IAgvData } from '@packages/shared';
// DataBuffer.getInstance().pushData(data);
//# sourceMappingURL=index.js.map