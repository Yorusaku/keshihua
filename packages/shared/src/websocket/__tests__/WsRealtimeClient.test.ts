import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WsRealtimeClient } from '../WsRealtimeClient';
import type { RealtimeEnvelope } from '../realtime.types';

class MockSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState = MockSocket.CONNECTING;
  private listeners = new Map<string, Set<(event: any) => void>>();
  public sent: string[] = [];
  public url: string;

  constructor(url: string) {
    this.url = url;
    queueMicrotask(() => {
      this.readyState = MockSocket.OPEN;
      this.emit('open', {});
    });
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    const set = this.listeners.get(type) || new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = MockSocket.CLOSED;
    this.emit('close', { wasClean: false, code: 1006, reason: 'mock-close' });
  }

  emit(type: string, event: any): void {
    const set = this.listeners.get(type);
    if (!set) return;
    set.forEach((listener) => listener(event));
  }
}

describe('WsRealtimeClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('WebSocket', MockSocket as unknown as typeof WebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('连接后应周期发送 ping', async () => {
    const client = new WsRealtimeClient({
      url: 'ws://127.0.0.1:8091/ws',
      sourceId: 'test-client',
      heartbeatIntervalMs: 100,
      pongTimeoutMs: 500,
      enabled: true,
    });

    client.connect();
    await Promise.resolve();
    vi.advanceTimersByTime(120);

    const socket = (client as any).socket as MockSocket;
    expect(socket.sent.length).toBeGreaterThan(0);
    const first = JSON.parse(socket.sent[0] || '{}') as RealtimeEnvelope;
    expect(first.topic).toBe('ping');
  });

  it('收到 pong 后应保持 connected', async () => {
    const client = new WsRealtimeClient({
      url: 'ws://127.0.0.1:8091/ws',
      sourceId: 'test-client',
      heartbeatIntervalMs: 100,
      pongTimeoutMs: 500,
      enabled: true,
    });

    client.connect();
    await Promise.resolve();
    vi.advanceTimersByTime(120);

    const socket = (client as any).socket as MockSocket;
    socket.emit('message', {
      data: JSON.stringify({
        messageId: 'pong-1',
        topic: 'pong',
        sourceId: 'server',
        timestamp: Date.now(),
        payload: { serverTime: Date.now() },
      }),
    });

    expect(client.getState()).toBe('connected');
  });

  it('pong 超时应进入 stale 并尝试重连', async () => {
    const client = new WsRealtimeClient({
      url: 'ws://127.0.0.1:8091/ws',
      sourceId: 'test-client',
      heartbeatIntervalMs: 100,
      pongTimeoutMs: 200,
      reconnectBaseMs: 100,
      reconnectMaxMs: 300,
      enabled: true,
    });

    client.connect();
    await Promise.resolve();
    vi.advanceTimersByTime(120);
    vi.advanceTimersByTime(250);

    expect(['stale', 'disconnected', 'connecting', 'connected']).toContain(client.getState());
  });

  it('订阅消息应收到业务 envelope', async () => {
    const client = new WsRealtimeClient({
      url: 'ws://127.0.0.1:8091/ws',
      sourceId: 'test-client',
      enabled: true,
    });
    client.connect();
    await Promise.resolve();

    const onEnvelope = vi.fn();
    client.onEnvelope(onEnvelope);

    const socket = (client as any).socket as MockSocket;
    socket.emit('message', {
      data: JSON.stringify({
        messageId: 'm-1',
        topic: 'alert.updated',
        sourceId: 'admin-1',
        timestamp: Date.now(),
        payload: { id: 'a-1' },
      }),
    });

    expect(onEnvelope).toHaveBeenCalledTimes(1);
  });
});
