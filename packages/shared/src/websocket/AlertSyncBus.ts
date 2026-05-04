/**
 * 告警跨端同步总线
 * 文件职责：基于 BroadcastChannel 实现告警状态的跨标签页实时同步
 */

import type { SensorAlertItem } from '../provider/types';
import type { RealtimeEnvelope } from './realtime.types';

export interface AlertSyncBus {
  broadcastAlertAssigned: (alert: SensorAlertItem) => void;
  broadcastAlertAssignedEnvelope: (envelope: RealtimeEnvelope<SensorAlertItem>) => void;
  subscribeAlertAssigned: (callback: (alert: SensorAlertItem) => void) => () => void;
  subscribeAlertAssignedEnvelope: (
    callback: (envelope: RealtimeEnvelope<SensorAlertItem>) => void
  ) => () => void;

  broadcastAlertUpdated: (alert: SensorAlertItem) => void;
  broadcastAlertUpdatedEnvelope: (envelope: RealtimeEnvelope<SensorAlertItem>) => void;
  subscribeAlertUpdated: (callback: (alert: SensorAlertItem) => void) => () => void;
  subscribeAlertUpdatedEnvelope: (
    callback: (envelope: RealtimeEnvelope<SensorAlertItem>) => void
  ) => () => void;

  broadcastAlertClosed: (alert: SensorAlertItem) => void;
  broadcastAlertClosedEnvelope: (envelope: RealtimeEnvelope<SensorAlertItem>) => void;
  subscribeAlertClosed: (callback: (alert: SensorAlertItem) => void) => () => void;
  subscribeAlertClosedEnvelope: (
    callback: (envelope: RealtimeEnvelope<SensorAlertItem>) => void
  ) => () => void;
}

export const ALERT_SYNC_CHANNEL = 'alert-sync-channel';

interface AlertSyncMessage {
  type: 'assigned' | 'updated' | 'closed';
  data: SensorAlertItem;
}

interface AlertSyncEnvelopeMessage {
  type: 'assigned-envelope' | 'updated-envelope' | 'closed-envelope';
  data: RealtimeEnvelope<SensorAlertItem>;
}

export function createAlertSyncBus(): AlertSyncBus {
  // SSR 防御
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return {
      broadcastAlertAssigned: () => {},
      broadcastAlertAssignedEnvelope: () => {},
      subscribeAlertAssigned: () => () => {},
      subscribeAlertAssignedEnvelope: () => () => {},
      broadcastAlertUpdated: () => {},
      broadcastAlertUpdatedEnvelope: () => {},
      subscribeAlertUpdated: () => () => {},
      subscribeAlertUpdatedEnvelope: () => () => {},
      broadcastAlertClosed: () => {},
      broadcastAlertClosedEnvelope: () => {},
      subscribeAlertClosed: () => () => {},
      subscribeAlertClosedEnvelope: () => () => {},
    };
  }

  const channel = new BroadcastChannel(ALERT_SYNC_CHANNEL);

  const assignedSubscribers = new Set<(alert: SensorAlertItem) => void>();
  const updatedSubscribers = new Set<(alert: SensorAlertItem) => void>();
  const closedSubscribers = new Set<(alert: SensorAlertItem) => void>();
  const assignedEnvelopeSubscribers = new Set<(envelope: RealtimeEnvelope<SensorAlertItem>) => void>();
  const updatedEnvelopeSubscribers = new Set<(envelope: RealtimeEnvelope<SensorAlertItem>) => void>();
  const closedEnvelopeSubscribers = new Set<(envelope: RealtimeEnvelope<SensorAlertItem>) => void>();

  channel.addEventListener('message', (event: MessageEvent<AlertSyncMessage | AlertSyncEnvelopeMessage>) => {
    const { type, data } = event.data as AlertSyncMessage | AlertSyncEnvelopeMessage;

    switch (type) {
      case 'assigned':
        assignedSubscribers.forEach((cb) => cb(data));
        break;
      case 'assigned-envelope':
        assignedEnvelopeSubscribers.forEach((cb) => cb(data));
        assignedSubscribers.forEach((cb) => cb(data.payload));
        break;
      case 'updated':
        updatedSubscribers.forEach((cb) => cb(data));
        break;
      case 'updated-envelope':
        updatedEnvelopeSubscribers.forEach((cb) => cb(data));
        updatedSubscribers.forEach((cb) => cb(data.payload));
        break;
      case 'closed':
        closedSubscribers.forEach((cb) => cb(data));
        break;
      case 'closed-envelope':
        closedEnvelopeSubscribers.forEach((cb) => cb(data));
        closedSubscribers.forEach((cb) => cb(data.payload));
        break;
    }
  });

  return {
    broadcastAlertAssigned: (alert) => {
      channel.postMessage({ type: 'assigned', data: alert });
    },
    broadcastAlertAssignedEnvelope: (envelope) => {
      channel.postMessage({ type: 'assigned-envelope', data: envelope });
    },
    subscribeAlertAssigned: (callback) => {
      assignedSubscribers.add(callback);
      return () => assignedSubscribers.delete(callback);
    },
    subscribeAlertAssignedEnvelope: (callback) => {
      assignedEnvelopeSubscribers.add(callback);
      return () => assignedEnvelopeSubscribers.delete(callback);
    },

    broadcastAlertUpdated: (alert) => {
      channel.postMessage({ type: 'updated', data: alert });
    },
    broadcastAlertUpdatedEnvelope: (envelope) => {
      channel.postMessage({ type: 'updated-envelope', data: envelope });
    },
    subscribeAlertUpdated: (callback) => {
      updatedSubscribers.add(callback);
      return () => updatedSubscribers.delete(callback);
    },
    subscribeAlertUpdatedEnvelope: (callback) => {
      updatedEnvelopeSubscribers.add(callback);
      return () => updatedEnvelopeSubscribers.delete(callback);
    },

    broadcastAlertClosed: (alert) => {
      channel.postMessage({ type: 'closed', data: alert });
    },
    broadcastAlertClosedEnvelope: (envelope) => {
      channel.postMessage({ type: 'closed-envelope', data: envelope });
    },
    subscribeAlertClosed: (callback) => {
      closedSubscribers.add(callback);
      return () => closedSubscribers.delete(callback);
    },
    subscribeAlertClosedEnvelope: (callback) => {
      closedEnvelopeSubscribers.add(callback);
      return () => closedEnvelopeSubscribers.delete(callback);
    },
  };
}

export const alertSyncBus = createAlertSyncBus();
