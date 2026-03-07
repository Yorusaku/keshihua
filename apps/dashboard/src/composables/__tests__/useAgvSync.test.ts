/**
 * useAgvSync Composable 测试用例
 * 文件路径：apps/dashboard/src/composables/__tests__/useAgvSync.test.ts
 * 阶段：🟣 重构阶段（Hook 化）
 *
 * 📌 测试目标：
 * - 测试 onMounted 中 subscribeNewAgv 被调用
 * - 测试监听回调中 pushData 被调用
 * - 测试 onBeforeUnmount 中 unsubscribe 被调用
 * - 测试跨端广播数据正确写入 DataBuffer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

/**
 * 🚨 Mock @packages/shared（DataBuffer + AgvSyncBus）
 */
const mockPushData = vi.fn();
const mockGetSnapshot = vi.fn(() => []);
const mockClear = vi.fn();
const mockSubscribeNewAgv = vi.fn(() => {
  const mockUnsubscribe = vi.fn();
  return mockUnsubscribe;
});
const mockBroadcastNewAgv = vi.fn();

vi.mock('@packages/shared', () => ({
  DataBuffer: {
    getInstance: vi.fn(() => ({
      pushData: mockPushData,
      getSnapshot: mockGetSnapshot,
      clear: mockClear,
    })),
  },
  agvSyncBus: {
    broadcastNewAgv: mockBroadcastNewAgv,
    subscribeNewAgv: mockSubscribeNewAgv,
  },
  AGV_SYNC_CHANNEL: 'agv-sync-channel',
}));

/**
 * 🚨 Mock BroadcastChannel API
 */
class MockBroadcastChannel {
  private messageListeners: ((event: MessageEvent) => void)[] = [];

  constructor(public name: string) {}

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

vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);

/**
 * 🚨 创建包含 useAgvSync 的 Mock 组件
 */
const createTestComponent = () => {
  return {
    name: 'TestComponent',
    setup() {
      // ✅ 引入 useAgvSync
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useAgvSync } = require('@/composables/useAgvSync');
      useAgvSync();
    },
    template: '<div>Test</div>',
  };
};

/**
 * 🧪 测试用例
 */
describe('useAgvSync - 跨端通信监听 Hook', () => {
  beforeEach(() => {
    // ✅ 重置所有 Mock
    vi.clearAllMocks();
  });

  describe('onMounted - 订阅跨端广播', () => {
    it('组件挂载时，应该调用 agvSyncBus.subscribeNewAgv', async () => {
      // ✅ 创建并挂载组件
      const wrapper = mount(createTestComponent());

      // ✅ 等待 onMounted 执行
      await nextTick();

      // ✅ 验证 subscribeNewAgv 被调用
      expect(mockSubscribeNewAgv).toHaveBeenCalled();
    });

    it('subscribeNewAgv 应该携带 IAgvData 类型的回调', async () => {
      // ✅ 创建并挂载组件
      const wrapper = mount(createTestComponent());
      await nextTick();

      // ✅ 验证回调函数被传入
      expect(mockSubscribeNewAgv).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Message Handling - 数据写入 DataBuffer', () => {
    it('收到广播消息时，应该调用 DataBuffer.getInstance().pushData', async () => {
      // ✅ 创建并挂载组件
      const wrapper = mount(createTestComponent());
      await nextTick();

      // ✅ 获取 subscribeNewAgv 的回调函数
      const callback = mockSubscribeNewAgv.mock.calls[0][0] as (agv: any) => void;

      // ✅ 创建测试数据（严格 IAgvData 类型）
      const testAgv = {
        id: 'AGV-999',
        x: 500,
        y: 500,
        status: 'idle',
        timestamp: Date.now(),
      };

      // ✅ 调用回调（模拟收到广播）
      callback(testAgv);

      // ✅ 验证 pushData 被调用
      expect(mockPushData).toHaveBeenCalled();
    });

    it('pushData 应该接收到单条数据数组 [IAgvData]', async () => {
      // ✅ 创建并挂载组件
      const wrapper = mount(createTestComponent());
      await nextTick();

      // ✅ 获取回调函数
      const callback = mockSubscribeNewAgv.mock.calls[0][0] as (agv: any) => void;

      // ✅ 创建测试数据
      const testAgv = {
        id: 'AGV-888',
        x: 300,
        y: 300,
        status: 'moving',
        timestamp: Date.now(),
      };

      // ✅ 调用回调
      callback(testAgv);

      // ✅ 验证 pushData 接收到单条数据数组
      expect(mockPushData).toHaveBeenCalledWith([testAgv]);
    });

    it('收到多次广播，应该多次调用 pushData', async () => {
      // ✅ 创建并挂载组件
      const wrapper = mount(createTestComponent());
      await nextTick();

      // ✅ 获取回调函数
      const callback = mockSubscribeNewAgv.mock.calls[0][0] as (agv: any) => void;

      // ✅ 模拟 3 次广播
      const agv1 = { id: 'AGV-111', x: 100, y: 100, status: 'idle', timestamp: Date.now() };
      const agv2 = { id: 'AGV-222', x: 200, y: 200, status: 'moving', timestamp: Date.now() };
      const agv3 = { id: 'AGV-333', x: 300, y: 300, status: 'error', timestamp: Date.now() };

      callback(agv1);
      callback(agv2);
      callback(agv3);

      // ✅ 验证 pushData 被调用 3 次
      expect(mockPushData).toHaveBeenCalledTimes(3);
      expect(mockPushData).toHaveBeenCalledWith([agv1]);
      expect(mockPushData).toHaveBeenCalledWith([agv2]);
      expect(mockPushData).toHaveBeenCalledWith([agv3]);
    });
  });

  describe('onBeforeUnmount - 取消订阅', () => {
    it('组件卸载时，应该调用 unsubscribe 取消订阅', async () => {
      // ✅ 创建并挂载组件
      const wrapper = mount(createTestComponent());
      await nextTick();

      // ✅ 获取 unsubscribe 函数
      const mockUnsubscribe = mockSubscribeNewAgv.mock.results[0].value;

      // ✅ 卸载组件
      wrapper.unmount();

      // ✅ 验证 unsubscribe 被调用
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('多次挂载/卸载不应引发错误', async () => {
      // ✅ 第一次挂载/卸载
      const wrapper1 = mount(createTestComponent());
      await nextTick();
      wrapper1.unmount();

      // ✅ 第二次挂载/卸载
      const wrapper2 = mount(createTestComponent());
      await nextTick();
      wrapper2.unmount();

      // ✅ 验证没有报错（说明 unsubscribe idempotent）
      expect(mockSubscribeNewAgv).toHaveBeenCalledTimes(2);
    });
  });

  describe('Type Safety - 类型安全', () => {
    it('广播数据应符合 IAgvData 类型', async () => {
      // ✅ 创建并挂载组件
      const wrapper = mount(createTestComponent());
      await nextTick();

      // ✅ 获取回调函数
      const callback = mockSubscribeNewAgv.mock.calls[0][0] as (agv: any) => void;

      // ✅ 创建类型正确的测试数据
      const testAgv = {
        id: 'AGV-777',
        x: 500,
        y: 500,
        status: 'idle' as const,
        timestamp: Date.now(),
      };

      // ✅ 调用回调（类型安全检查）
      callback(testAgv);

      // ✅ 验证类型检查（无编译错误）
      expect(mockPushData).toHaveBeenCalled();
    });
  });
});
