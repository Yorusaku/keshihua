import type { SensorAlertItem } from '../provider/types';
import type { IAgvData } from './types';
import type { RealtimeEnvelope, RealtimePayloadByTopic, RealtimeTopic } from './realtime.types';
import type { WsRealtimeClient } from './WsRealtimeClient';

type TopicListener<T extends RealtimeTopic> = (
  envelope: RealtimeEnvelope<RealtimePayloadByTopic[T]>
) => void;

const TOPIC_LIST = [
  'agv.created',
  'alert.assigned',
  'alert.updated',
  'alert.closed',
] as const satisfies RealtimeTopic[];

export class DomainRealtimeBus {
  private readonly wsClient: WsRealtimeClient;
  private readonly listeners: {
    [K in RealtimeTopic]?: Set<TopicListener<K>>;
  } = {};
  private readonly seenMessage = new Map<string, number>();
  private readonly dedupTtlMs = 60_000;

  constructor(wsClient: WsRealtimeClient) {
    this.wsClient = wsClient;
    this.wsClient.onEnvelope((envelope) => {
      this.handleEnvelope(envelope);
    });
  }

  public publishEnvelope<T extends RealtimeTopic>(
    envelope: RealtimeEnvelope<RealtimePayloadByTopic[T]>
  ): boolean {
    return this.wsClient.sendRawEnvelope(envelope);
  }

  public publishAgvCreated(agv: IAgvData): RealtimeEnvelope<IAgvData> | null {
    return this.wsClient.sendEnvelope('agv.created', agv);
  }

  public publishAlertAssigned(alert: SensorAlertItem): RealtimeEnvelope<SensorAlertItem> | null {
    return this.wsClient.sendEnvelope('alert.assigned', alert);
  }

  public publishAlertUpdated(alert: SensorAlertItem): RealtimeEnvelope<SensorAlertItem> | null {
    return this.wsClient.sendEnvelope('alert.updated', alert);
  }

  public publishAlertClosed(alert: SensorAlertItem): RealtimeEnvelope<SensorAlertItem> | null {
    return this.wsClient.sendEnvelope('alert.closed', alert);
  }

  public subscribe<T extends RealtimeTopic>(topic: T, listener: TopicListener<T>): () => void {
    const existing = this.listeners[topic] as Set<TopicListener<T>> | undefined;
    const set = existing ?? new Set<TopicListener<T>>();
    if (!existing) {
      this.listeners[topic] = set as Set<TopicListener<RealtimeTopic>>;
    }
    set.add(listener);
    return () => {
      set.delete(listener);
    };
  }

  private handleEnvelope(envelope: RealtimeEnvelope): void {
    if (!TOPIC_LIST.includes(envelope.topic as (typeof TOPIC_LIST)[number])) {
      return;
    }

    const dedupKey = `${envelope.messageId}:${envelope.sourceId}`;
    const now = Date.now();
    this.cleanupDedupCache(now);
    if (this.seenMessage.has(dedupKey)) {
      return;
    }
    this.seenMessage.set(dedupKey, now);

    const topic = envelope.topic as RealtimeTopic;
    const set = this.listeners[topic] as Set<TopicListener<RealtimeTopic>> | undefined;
    if (!set || !set.size) {
      return;
    }
    set.forEach((listener) => listener(envelope as RealtimeEnvelope<RealtimePayloadByTopic[RealtimeTopic]>));
  }

  private cleanupDedupCache(now: number): void {
    this.seenMessage.forEach((timestamp, key) => {
      if (now - timestamp > this.dedupTtlMs) {
        this.seenMessage.delete(key);
      }
    });
  }
}

export function createDomainRealtimeBus(client: WsRealtimeClient): DomainRealtimeBus {
  return new DomainRealtimeBus(client);
}
