import { createDomainRealtimeBus } from './DomainRealtimeBus';
import { createWsRealtimeClient } from './WsRealtimeClient';
import {
  createRealtimeSourceId,
  type RealtimeConnectionState,
  type WsClientReporter,
  type WsClientConfig,
} from './realtime.types';

let wsClientSingleton: ReturnType<typeof createWsRealtimeClient> | null = null;
let domainBusSingleton: ReturnType<typeof createDomainRealtimeBus> | null = null;
const connectionListeners = new Set<(state: RealtimeConnectionState) => void>();
let realtimeReporter: WsClientReporter | null = null;

function isTestRuntime(): boolean {
  const mode = String(import.meta.env?.MODE || '').toLowerCase();
  const vitestFlag = String((globalThis as { process?: { env?: Record<string, string> } }).process?.env?.VITEST || '');
  return mode === 'test' || vitestFlag === 'true';
}

function getRealtimeConfig(overrides?: Partial<WsClientConfig>): WsClientConfig {
  const env = import.meta.env;
  const url = (overrides?.url || env.VITE_REALTIME_WS_URL || 'ws://127.0.0.1:8090/ws') as string;
  const enabled =
    overrides?.enabled ??
    (isTestRuntime() ? false : String(env.VITE_REALTIME_ENABLE ?? '1') !== '0');
  const sourceId = overrides?.sourceId || createRealtimeSourceId('web');

  return {
    url,
    enabled,
    sourceId,
    heartbeatIntervalMs: overrides?.heartbeatIntervalMs,
    pongTimeoutMs: overrides?.pongTimeoutMs,
    reconnectBaseMs: overrides?.reconnectBaseMs,
    reconnectMaxMs: overrides?.reconnectMaxMs,
    reporter: overrides?.reporter || realtimeReporter,
  };
}

export function getRealtimeClient(overrides?: Partial<WsClientConfig>) {
  if (wsClientSingleton) {
    return wsClientSingleton;
  }
  const config = getRealtimeConfig(overrides);
  wsClientSingleton = createWsRealtimeClient(config);
  wsClientSingleton.onConnectionState((state) => {
    connectionListeners.forEach((listener) => listener(state));
  });
  wsClientSingleton.connect();
  return wsClientSingleton;
}

export function getDomainRealtimeBus(overrides?: Partial<WsClientConfig>) {
  if (domainBusSingleton) {
    return domainBusSingleton;
  }
  const client = getRealtimeClient(overrides);
  domainBusSingleton = createDomainRealtimeBus(client);
  return domainBusSingleton;
}

export function onRealtimeConnectionState(
  listener: (state: RealtimeConnectionState) => void
): () => void {
  connectionListeners.add(listener);
  if (wsClientSingleton) {
    listener(wsClientSingleton.getState());
  } else {
    listener('disconnected');
  }
  return () => {
    connectionListeners.delete(listener);
  };
}

export function closeRealtime(): void {
  if (wsClientSingleton) {
    wsClientSingleton.disconnect();
  }
  wsClientSingleton = null;
  domainBusSingleton = null;
  connectionListeners.clear();
}

export function setRealtimeReporter(reporter: WsClientReporter | null): void {
  realtimeReporter = reporter;
}
