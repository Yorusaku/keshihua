/**
 * AgvSyncBus - 跨端通信总线
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 核心功能：
 * - 基于 BroadcastChannel API 实现跨 Tab/窗口实时通信
 * - 单例模式确保全局唯一实例
 * - 支持订阅/取消订阅机制
 *
 * 📌 监控扩展（任务二）：
 * - 支持 WebSocket 封装类（当需要真实 WebSocket 通信时）
 * - 提供错误捕获与断连监控能力
 */

import type { IAgvData } from './types';
import type { RealtimeEnvelope } from './realtime.types';

/**
 * 📌 AgvSyncBus 接口
 * @description 定义跨端通信总线的 API
 */
export interface AgvSyncBus {
  /**
   * 广播新车数据
   * @param agv 新增的 AGV 数据
   */
  broadcastNewAgv: (agv: IAgvData) => void;

  /**
   * 广播新车数据（Envelope 版本）
   * @param envelope 包含 messageId/sourceId 的实时消息
   */
  broadcastNewAgvEnvelope: (envelope: RealtimeEnvelope<IAgvData>) => void;

  /**
   * 订阅新车数据
   * @param callback 收到新车数据时的回调函数
   * @returns unsubscribe 函数，用于取消订阅
   */
  subscribeNewAgv: (callback: (agv: IAgvData) => void) => () => void;

  /**
   * 订阅新车数据（Envelope 版本）
   */
  subscribeNewAgvEnvelope: (
    callback: (envelope: RealtimeEnvelope<IAgvData>) => void
  ) => () => void;
}

/**
 * 📌 广播频道名称（常量）
 * @description 用于标识跨端通信的频道
 */
export const AGV_SYNC_CHANNEL = 'agv-sync-channel';

/**
 * 📌 创建 AgvSyncBus 实例（单例模式）
 * @description 封装 BroadcastChannel，提供广播和订阅能力
 */
function createAgvSyncBus(): AgvSyncBus {
  // ✅ 创建 BroadcastChannel 实例
  const channel = new BroadcastChannel(AGV_SYNC_CHANNEL);

  // ✅ 存储所有订阅的回调函数
  const subscribers = new Set<(agv: IAgvData) => void>();
  const envelopeSubscribers = new Set<(envelope: RealtimeEnvelope<IAgvData>) => void>();

  // ✅ 监听 message 事件，分发给所有订阅者
  channel.addEventListener('message', (event: MessageEvent<IAgvData | RealtimeEnvelope<IAgvData>>) => {
    const data = event.data;
    if (data && typeof data === 'object' && 'messageId' in data && 'payload' in data) {
      const envelope = data as RealtimeEnvelope<IAgvData>;
      envelopeSubscribers.forEach((callback) => callback(envelope));
      subscribers.forEach((callback) => callback(envelope.payload));
      return;
    }
    const agv = data as IAgvData;
    subscribers.forEach(callback => callback(agv));
  });

  return {
    /**
     * 广播新车数据
     * @param agv 新增的 AGV 数据
     */
    broadcastNewAgv: (agv: IAgvData): void => {
      channel.postMessage(agv);
    },
    broadcastNewAgvEnvelope: (envelope: RealtimeEnvelope<IAgvData>): void => {
      channel.postMessage(envelope);
    },

    /**
     * 订阅新车数据
     * @param callback 收到新车数据时的回调函数
     * @returns unsubscribe 函数
     */
    subscribeNewAgv: (callback: (agv: IAgvData) => void): (() => void) => {
      subscribers.add(callback);

      // ✅ 返回 unsubscribe 函数
      return () => {
        subscribers.delete(callback);
      };
    },
    subscribeNewAgvEnvelope: (
      callback: (envelope: RealtimeEnvelope<IAgvData>) => void
    ): (() => void) => {
      envelopeSubscribers.add(callback);
      return () => {
        envelopeSubscribers.delete(callback);
      };
    },
  };
}

/**
 * 📌 单例实例
 * @description 全局唯一实例，导出供 Admin 和 Dashboard 使用
 */
export const agvSyncBus = createAgvSyncBus();
