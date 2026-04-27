/**
 * AlertSyncBus 测试
 * 测试告警跨端同步总线的核心功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SensorAlertItem } from '../../provider/types';
import { createAlertSyncBus } from '../AlertSyncBus';
import type { AlertSyncBus } from '../AlertSyncBus';

describe('AlertSyncBus', () => {
  let mockChannel: {
    postMessage: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };
  let messageListeners: Array<(event: MessageEvent) => void> = [];
  let alertSyncBus: AlertSyncBus;

  beforeEach(() => {
    messageListeners = [];
    mockChannel = {
      postMessage: vi.fn(),
      addEventListener: vi.fn((event: string, listener: (event: MessageEvent) => void) => {
        if (event === 'message') {
          messageListeners.push(listener);
        }
      }),
      close: vi.fn(),
    };

    // @ts-expect-error - Mock BroadcastChannel
    global.BroadcastChannel = vi.fn(function() {
      return mockChannel;
    });

    // 在每个测试前创建新实例
    alertSyncBus = createAlertSyncBus();
  });

  afterEach(() => {
    vi.clearAllMocks();
    messageListeners = [];
  });

  describe('SSR 防御', () => {
    it('在 window 不存在时返回空实现', async () => {
      const originalWindow = global.window;
      // @ts-expect-error - 模拟 SSR 环境
      delete global.window;

      // 重新导入模块以触发 SSR 防御
      const module = await import('../AlertSyncBus?t=' + Date.now());
      const bus = module.alertSyncBus;

      expect(bus.broadcastAlertAssigned).toBeDefined();
      expect(bus.subscribeAlertAssigned).toBeDefined();

      const unsubscribe = bus.subscribeAlertAssigned(() => {});
      expect(unsubscribe).toBeInstanceOf(Function);

      global.window = originalWindow;
    });

    it('在 BroadcastChannel 不存在时返回空实现', async () => {
      const originalBC = global.BroadcastChannel;
      // @ts-expect-error - 模拟不支持 BroadcastChannel 的环境
      delete global.BroadcastChannel;

      const module = await import('../AlertSyncBus?t=' + Date.now());
      const bus = module.alertSyncBus;

      expect(bus.broadcastAlertAssigned).toBeDefined();
      expect(bus.subscribeAlertAssigned).toBeDefined();

      global.BroadcastChannel = originalBC;
    });
  });

  describe('告警分配同步', () => {
    it('广播告警分配事件', () => {

      const mockAlert: SensorAlertItem = {
        id: 'alert-001',
        sensorId: 'sensor-001',
        lineId: 'line-a',
        severity: 'critical',
        status: 'active',
        title: '测试告警',
        message: '测试消息',
        threshold: 100,
        value: 150,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议',
        processingStatus: 'assigned',
        assignedTo: 'user-001',
      };

      alertSyncBus.broadcastAlertAssigned(mockAlert);

      expect(mockChannel.postMessage).toHaveBeenCalledWith({
        type: 'assigned',
        data: mockAlert,
      });
    });

    it('订阅告警分配事件', () => {
      const callback = vi.fn();
      const unsubscribe = alertSyncBus.subscribeAlertAssigned(callback);

      const mockAlert: SensorAlertItem = {
        id: 'alert-002',
        sensorId: 'sensor-002',
        lineId: 'line-b',
        severity: 'high',
        status: 'active',
        title: '测试告警2',
        message: '测试消息2',
        threshold: 80,
        value: 120,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议2',
        processingStatus: 'assigned',
        assignedTo: 'user-002',
      };

      // 模拟接收消息
      messageListeners.forEach((listener) => {
        listener(new MessageEvent('message', {
          data: { type: 'assigned', data: mockAlert },
        }));
      });

      expect(callback).toHaveBeenCalledWith(mockAlert);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('取消订阅后不再接收事件', () => {
      const callback = vi.fn();
      const unsubscribe = alertSyncBus.subscribeAlertAssigned(callback);

      unsubscribe();

      const mockAlert: SensorAlertItem = {
        id: 'alert-003',
        sensorId: 'sensor-003',
        lineId: 'line-c',
        severity: 'medium',
        status: 'active',
        title: '测试告警3',
        message: '测试消息3',
        threshold: 60,
        value: 90,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议3',
      };

      messageListeners.forEach((listener) => {
        listener(new MessageEvent('message', {
          data: { type: 'assigned', data: mockAlert },
        }));
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('告警更新同步', () => {
    it('广播告警更新事件', () => {
      const mockAlert: SensorAlertItem = {
        id: 'alert-004',
        sensorId: 'sensor-004',
        lineId: 'line-a',
        severity: 'critical',
        status: 'acknowledged',
        title: '测试告警4',
        message: '测试消息4',
        threshold: 100,
        value: 150,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议4',
        processingStatus: 'in_progress',
      };

      alertSyncBus.broadcastAlertUpdated(mockAlert);

      expect(mockChannel.postMessage).toHaveBeenCalledWith({
        type: 'updated',
        data: mockAlert,
      });
    });

    it('订阅告警更新事件', () => {
      const callback = vi.fn();
      alertSyncBus.subscribeAlertUpdated(callback);

      const mockAlert: SensorAlertItem = {
        id: 'alert-005',
        sensorId: 'sensor-005',
        lineId: 'line-b',
        severity: 'high',
        status: 'acknowledged',
        title: '测试告警5',
        message: '测试消息5',
        threshold: 80,
        value: 120,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议5',
        processingStatus: 'in_progress',
      };

      messageListeners.forEach((listener) => {
        listener(new MessageEvent('message', {
          data: { type: 'updated', data: mockAlert },
        }));
      });

      expect(callback).toHaveBeenCalledWith(mockAlert);
    });
  });

  describe('告警关闭同步', () => {
    it('广播告警关闭事件', () => {
      const mockAlert: SensorAlertItem = {
        id: 'alert-006',
        sensorId: 'sensor-006',
        lineId: 'line-c',
        severity: 'medium',
        status: 'resolved',
        title: '测试告警6',
        message: '测试消息6',
        threshold: 60,
        value: 90,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议6',
        processingStatus: 'completed',
        mttr: 3600000,
      };

      alertSyncBus.broadcastAlertClosed(mockAlert);

      expect(mockChannel.postMessage).toHaveBeenCalledWith({
        type: 'closed',
        data: mockAlert,
      });
    });

    it('订阅告警关闭事件', () => {
      const callback = vi.fn();
      alertSyncBus.subscribeAlertClosed(callback);

      const mockAlert: SensorAlertItem = {
        id: 'alert-007',
        sensorId: 'sensor-007',
        lineId: 'line-a',
        severity: 'critical',
        status: 'resolved',
        title: '测试告警7',
        message: '测试消息7',
        threshold: 100,
        value: 150,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议7',
        processingStatus: 'completed',
        mttr: 7200000,
      };

      messageListeners.forEach((listener) => {
        listener(new MessageEvent('message', {
          data: { type: 'closed', data: mockAlert },
        }));
      });

      expect(callback).toHaveBeenCalledWith(mockAlert);
    });
  });

  describe('多订阅者场景', () => {
    it('支持多个订阅者同时接收事件', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      alertSyncBus.subscribeAlertAssigned(callback1);
      alertSyncBus.subscribeAlertAssigned(callback2);
      alertSyncBus.subscribeAlertAssigned(callback3);

      const mockAlert: SensorAlertItem = {
        id: 'alert-008',
        sensorId: 'sensor-008',
        lineId: 'line-b',
        severity: 'high',
        status: 'active',
        title: '测试告警8',
        message: '测试消息8',
        threshold: 80,
        value: 120,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议8',
        processingStatus: 'assigned',
      };

      messageListeners.forEach((listener) => {
        listener(new MessageEvent('message', {
          data: { type: 'assigned', data: mockAlert },
        }));
      });

      expect(callback1).toHaveBeenCalledWith(mockAlert);
      expect(callback2).toHaveBeenCalledWith(mockAlert);
      expect(callback3).toHaveBeenCalledWith(mockAlert);
    });

    it('取消单个订阅者不影响其他订阅者', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      alertSyncBus.subscribeAlertAssigned(callback1);
      const unsubscribe2 = alertSyncBus.subscribeAlertAssigned(callback2);

      unsubscribe2();

      const mockAlert: SensorAlertItem = {
        id: 'alert-009',
        sensorId: 'sensor-009',
        lineId: 'line-c',
        severity: 'medium',
        status: 'active',
        title: '测试告警9',
        message: '测试消息9',
        threshold: 60,
        value: 90,
        timestamp: Date.now(),
        impactedAgvIds: [],
        suggestion: '测试建议9',
        processingStatus: 'assigned',
      };

      messageListeners.forEach((listener) => {
        listener(new MessageEvent('message', {
          data: { type: 'assigned', data: mockAlert },
        }));
      });

      expect(callback1).toHaveBeenCalledWith(mockAlert);
      expect(callback2).not.toHaveBeenCalled();
    });
  });
});
