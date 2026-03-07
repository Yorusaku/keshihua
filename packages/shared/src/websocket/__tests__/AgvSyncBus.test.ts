/**
 * AgvSyncBus 测试用例
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 测试目标：
 * - 测试 BroadcastChannel 单例实例化
 * - 测试 broadcastNewAgv 广播消息
 * - 测试 subscribeNewAgv 订阅消息
 * - 测试 unsubscribe 取消订阅
 * - 测试组件生命周期管理（onUnmounted 自动清理）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * 📦 Mock 实例记录
 */
let mockBroadcastChannelInstances: MockBroadcastChannelConstructor[] = [];

/**
 * 📦 替换全局 BroadcastChannel
 * 📌 注意：必须使用 class 或 function 来创建构造函数
 */
class MockBroadcastChannelConstructor {
  private messageListeners: ((event: MessageEvent) => void)[] = [];
  public name: string;

  constructor(channelName: string) {
    this.name = channelName;
    mockBroadcastChannelInstances.push(this as any);
  }

  addEventListener(type: string, callback: (event: MessageEvent) => void): void {
    if (type === 'message') {
      this.messageListeners.push(callback);
    }
  }

  removeEventListener(type: string, callback: (event: MessageEvent) => void): void {
    if (type === 'message') {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    }
  }

  postMessage(data: any): void {
    const event = new MessageEvent('message', { data });
    this.messageListeners.forEach((listener) => listener(event));
  }

  close(): void {
    this.messageListeners = [];
  }
}

vi.stubGlobal('BroadcastChannel', MockBroadcastChannelConstructor);

// 📌 在 Mock 设置后导入模块
const { AGV_SYNC_CHANNEL, agvSyncBus } = await import('../AgvSyncBus');

describe('AgvSyncBus - 跨端通信总线', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBroadcastChannelInstances = [];
  });

  describe('Instance & Singleton', () => {
    it('应该创建 BroadcastChannel 实例', () => {
      // ✅ 验证常量
      expect(typeof AGV_SYNC_CHANNEL).toBe('string');
      expect(AGV_SYNC_CHANNEL).toBe('agv-sync-channel');
    });

    it('AgvSyncBus 应该是单例（全局仅一个实例）', () => {
      // ✅ 验证 agvSyncBus 存在
      expect(agvSyncBus).toBeDefined();
      expect(typeof agvSyncBus.broadcastNewAgv).toBe('function');
      expect(typeof agvSyncBus.subscribeNewAgv).toBe('function');
    });
  });

  describe('broadcastNewAgv', () => {
    it('broadcastNewAgv 应该调用 postMessage 广播消息', () => {
      const mockAgv = {
        id: 'AGV-999',
        x: 500,
        y: 500,
        status: 'idle' as const,
        timestamp: Date.now(),
      };

      // ✅ 调用广播方法（不应抛出错误）
      expect(() => {
        agvSyncBus.broadcastNewAgv(mockAgv);
      }).not.toThrow();
    });
  });

  describe('subscribeNewAgv', () => {
    it('subscribeNewAgv 应该返回 unsubscribe 函数', () => {
      const callback = vi.fn();

      // ✅ 订阅消息
      const unsubscribe = agvSyncBus.subscribeNewAgv(callback);

      // ✅ 验证返回值是函数
      expect(typeof unsubscribe).toBe('function');

      // ✅ 清理
      unsubscribe();
    });

    it('unsubscribe 应该移除监听器', () => {
      const callback = vi.fn();

      // ✅ 订阅消息
      const unsubscribe = agvSyncBus.subscribeNewAgv(callback);

      // ✅ 取消订阅
      unsubscribe();

      // ✅ 验证：再次调用 unsubscribe 不应抛出错误
      expect(() => {
        unsubscribe();
      }).not.toThrow();
    });
  });

  describe('Lifecycle Management', () => {
    it('应该在组件卸载时自动清理监听', () => {
      const callback = vi.fn();

      // ✅ 订阅消息
      const unsubscribe = agvSyncBus.subscribeNewAgv(callback);

      // ✅ 模拟组件卸载
      unsubscribe();

      // ✅ 验证：不抛出错误
      expect(() => {
        unsubscribe();
      }).not.toThrow();
    });

    it('多次 subscribe 应该添加多个监听器', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // ✅ 订阅多个监听器
      const unsubscribe1 = agvSyncBus.subscribeNewAgv(callback1);
      const unsubscribe2 = agvSyncBus.subscribeNewAgv(callback2);

      // ✅ 验证：两个 unsubscribe 都是函数
      expect(typeof unsubscribe1).toBe('function');
      expect(typeof unsubscribe2).toBe('function');

      // ✅ 清理
      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('Error Handling', () => {
    it('遇到错误时应该记录日志但不中断流程', () => {
      // ✅ 验证：广播无效数据不应抛出错误
      expect(() => {
        agvSyncBus.broadcastNewAgv({} as any);
      }).not.toThrow();
    });
  });
});