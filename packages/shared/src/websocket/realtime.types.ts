import type { SensorAlertItem } from '../provider/types';
import type { IAgvData } from './types';

export type RealtimeTopic =
  | 'ping'
  | 'pong'
  | 'agv.created'
  | 'alert.assigned'
  | 'alert.updated'
  | 'alert.closed';

export interface RealtimePayloadByTopic {
  ping: { clientTime: number };
  pong: { serverTime: number; echoMessageId?: string };
  'agv.created': IAgvData;
  'alert.assigned': SensorAlertItem;
  'alert.updated': SensorAlertItem;
  'alert.closed': SensorAlertItem;
}

export interface RealtimeEnvelope<T = unknown> {
  messageId: string;
  topic: RealtimeTopic;
  sourceId: string;
  timestamp: number;
  payload: T;
}

export type RealtimeEnvelopeByTopic<T extends RealtimeTopic> = RealtimeEnvelope<
  RealtimePayloadByTopic[T]
>;

export type RealtimeConnectionState =
  | 'connecting'
  | 'connected'
  | 'stale'
  | 'disconnected';

export interface WsClientReporter {
  report: (data: unknown) => void;
}

export interface WsClientConfig {
  url: string;
  sourceId: string;
  enabled?: boolean;
  heartbeatIntervalMs?: number;
  pongTimeoutMs?: number;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
  reporter?: WsClientReporter | null;
}

export function createRealtimeMessageId(prefix: string = 'rt'): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${randomPart}`;
}

export function createRealtimeSourceId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${randomPart}`;
}
