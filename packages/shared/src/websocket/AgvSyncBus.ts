/**
 * AgvSyncBus - 跨端通信总线
 * 阶段：🔴 红灯阶段（占位文件 - 业务逻辑待实现）
 *
 * 📌 红灯说明：
 * - 此文件为占位文件，所有方法抛出 "Not implemented (Red Light)" 错误
 * - 绿灯阶段将实现完整的 BroadcastChannel 封装
 */

import type { IAgvData } from './types';

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
   * 订阅新车数据
   * @param callback 收到新车数据时的回调函数
   * @returns unsubscribe 函数，用于取消订阅
   */
  subscribeNewAgv: (callback: (agv: IAgvData) => void) => () => void;
}

/**
 * 📌 广播频道名称（常量）
 * @description 用于标识跨端通信的频道
 */
export const AGV_SYNC_CHANNEL = 'agv-sync-channel';

/**
 * 📌 占位实现（红灯阶段）
 * @description 抛出错误，表示功能尚未实现
 */
const placeholderBus: AgvSyncBus = {
  broadcastNewAgv: () => {
    throw new Error('Not implemented (Red Light): broadcastNewAgv');
  },

  subscribeNewAgv: () => {
    throw new Error('Not implemented (Red Light): subscribeNewAgv');
  },
};

/**
 * 📌 单例实例（占位）
 * @description 导出供全局使用
 */
export const agvSyncBus = placeholderBus;
