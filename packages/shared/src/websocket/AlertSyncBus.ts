/**
 * 告警跨端同步总线
 * 文件职责：基于 BroadcastChannel 实现告警状态的跨标签页实时同步
 */

import type { SensorAlertItem } from '../provider/types';

export interface AlertSyncBus {
  broadcastAlertAssigned: (alert: SensorAlertItem) => void;
  subscribeAlertAssigned: (callback: (alert: SensorAlertItem) => void) => () => void;

  broadcastAlertUpdated: (alert: SensorAlertItem) => void;
  subscribeAlertUpdated: (callback: (alert: SensorAlertItem) => void) => () => void;

  broadcastAlertClosed: (alert: SensorAlertItem) => void;
  subscribeAlertClosed: (callback: (alert: SensorAlertItem) => void) => () => void;
}

export const ALERT_SYNC_CHANNEL = 'alert-sync-channel';

interface AlertSyncMessage {
  type: 'assigned' | 'updated' | 'closed';
  data: SensorAlertItem;
}

export function createAlertSyncBus(): AlertSyncBus {
  // SSR 防御
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return {
      broadcastAlertAssigned: () => {},
      subscribeAlertAssigned: () => () => {},
      broadcastAlertUpdated: () => {},
      subscribeAlertUpdated: () => () => {},
      broadcastAlertClosed: () => {},
      subscribeAlertClosed: () => () => {},
    };
  }

  const channel = new BroadcastChannel(ALERT_SYNC_CHANNEL);

  const assignedSubscribers = new Set<(alert: SensorAlertItem) => void>();
  const updatedSubscribers = new Set<(alert: SensorAlertItem) => void>();
  const closedSubscribers = new Set<(alert: SensorAlertItem) => void>();

  channel.addEventListener('message', (event: MessageEvent<AlertSyncMessage>) => {
    const { type, data } = event.data;

    switch (type) {
      case 'assigned':
        assignedSubscribers.forEach((cb) => cb(data));
        break;
      case 'updated':
        updatedSubscribers.forEach((cb) => cb(data));
        break;
      case 'closed':
        closedSubscribers.forEach((cb) => cb(data));
        break;
    }
  });

  return {
    broadcastAlertAssigned: (alert) => {
      channel.postMessage({ type: 'assigned', data: alert });
    },
    subscribeAlertAssigned: (callback) => {
      assignedSubscribers.add(callback);
      return () => assignedSubscribers.delete(callback);
    },

    broadcastAlertUpdated: (alert) => {
      channel.postMessage({ type: 'updated', data: alert });
    },
    subscribeAlertUpdated: (callback) => {
      updatedSubscribers.add(callback);
      return () => updatedSubscribers.delete(callback);
    },

    broadcastAlertClosed: (alert) => {
      channel.postMessage({ type: 'closed', data: alert });
    },
    subscribeAlertClosed: (callback) => {
      closedSubscribers.add(callback);
      return () => closedSubscribers.delete(callback);
    },
  };
}

export const alertSyncBus = createAlertSyncBus();
