import {
  type RealtimeConnectionState,
  type RealtimeEnvelope,
  type RealtimeTopic,
  type WsClientConfig,
  createRealtimeMessageId,
} from './realtime.types';

type EnvelopeListener = (envelope: RealtimeEnvelope) => void;
type StateListener = (state: RealtimeConnectionState) => void;

const DEFAULT_HEARTBEAT_INTERVAL_MS = 10_000;
const DEFAULT_PONG_TIMEOUT_MS = 30_000;
const DEFAULT_RECONNECT_BASE_MS = 1_000;
const DEFAULT_RECONNECT_MAX_MS = 15_000;

export class WsRealtimeClient {
  private readonly config: Required<Omit<WsClientConfig, 'reporter'>> & Pick<WsClientConfig, 'reporter'>;
  private socket: WebSocket | null = null;
  private manualClose = false;
  private heartbeatTimer: number | null = null;
  private pongTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private state: RealtimeConnectionState = 'disconnected';
  private readonly envelopeListeners = new Set<EnvelopeListener>();
  private readonly stateListeners = new Set<StateListener>();

  constructor(config: WsClientConfig) {
    this.config = {
      url: config.url,
      sourceId: config.sourceId,
      enabled: config.enabled ?? true,
      heartbeatIntervalMs: config.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS,
      pongTimeoutMs: config.pongTimeoutMs ?? DEFAULT_PONG_TIMEOUT_MS,
      reconnectBaseMs: config.reconnectBaseMs ?? DEFAULT_RECONNECT_BASE_MS,
      reconnectMaxMs: config.reconnectMaxMs ?? DEFAULT_RECONNECT_MAX_MS,
      reporter: config.reporter ?? null,
    };
  }

  public getState(): RealtimeConnectionState {
    return this.state;
  }

  public getSourceId(): string {
    return this.config.sourceId;
  }

  public connect(): void {
    if (!this.config.enabled) {
      return;
    }
    if (typeof WebSocket === 'undefined') {
      this.updateState('disconnected');
      this.report('WebSocket is not available in current runtime');
      return;
    }
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.manualClose = false;
    this.clearReconnectTimer();
    this.updateState('connecting');

    try {
      this.socket = new WebSocket(this.config.url);
    } catch (error) {
      this.report('Failed to create WebSocket instance', error);
      this.updateState('disconnected');
      this.scheduleReconnect();
      return;
    }

    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('close', this.handleClose);
    this.socket.addEventListener('error', this.handleError);
  }

  public disconnect(): void {
    this.manualClose = true;
    this.clearHeartbeatTimer();
    this.clearPongTimer();
    this.clearReconnectTimer();
    if (this.socket) {
      this.socket.removeEventListener('open', this.handleOpen);
      this.socket.removeEventListener('message', this.handleMessage);
      this.socket.removeEventListener('close', this.handleClose);
      this.socket.removeEventListener('error', this.handleError);
      this.socket.close();
      this.socket = null;
    }
    this.updateState('disconnected');
  }

  public sendEnvelope<T>(topic: RealtimeTopic, payload: T): RealtimeEnvelope<T> | null {
    const envelope: RealtimeEnvelope<T> = {
      messageId: createRealtimeMessageId('ws'),
      topic,
      sourceId: this.config.sourceId,
      timestamp: Date.now(),
      payload,
    };
    return this.sendRawEnvelope(envelope) ? envelope : null;
  }

  public sendRawEnvelope<T>(envelope: RealtimeEnvelope<T>): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      this.socket.send(JSON.stringify(envelope));
      return true;
    } catch (error) {
      this.report('Failed to send realtime envelope', error);
      return false;
    }
  }

  public onEnvelope(listener: EnvelopeListener): () => void {
    this.envelopeListeners.add(listener);
    return () => {
      this.envelopeListeners.delete(listener);
    };
  }

  public onConnectionState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private readonly handleOpen = (): void => {
    this.reconnectAttempt = 0;
    this.updateState('connected');
    this.startHeartbeatLoop();
  };

  private readonly handleMessage = (event: MessageEvent): void => {
    let envelope: RealtimeEnvelope | null = null;
    try {
      envelope = JSON.parse(String(event.data)) as RealtimeEnvelope;
    } catch (error) {
      this.report('Failed to parse realtime message', error);
      return;
    }

    if (!envelope || typeof envelope !== 'object' || !('topic' in envelope)) {
      return;
    }

    if (envelope.topic === 'pong') {
      this.clearPongTimer();
      if (this.state !== 'connected') {
        this.updateState('connected');
      }
      return;
    }

    if (envelope.topic === 'ping') {
      this.sendEnvelope('pong', { serverTime: Date.now(), echoMessageId: envelope.messageId });
      return;
    }

    this.envelopeListeners.forEach((listener) => listener(envelope as RealtimeEnvelope));
  };

  private readonly handleClose = (event: CloseEvent): void => {
    this.clearHeartbeatTimer();
    this.clearPongTimer();
    this.socket = null;
    this.updateState('disconnected');
    if (!event.wasClean) {
      this.report('Realtime socket closed unexpectedly', {
        code: event.code,
        reason: event.reason,
      });
    }
    if (!this.manualClose) {
      this.scheduleReconnect();
    }
  };

  private readonly handleError = (event: Event): void => {
    this.report('Realtime socket error', event);
  };

  private startHeartbeatLoop(): void {
    this.clearHeartbeatTimer();
    this.clearPongTimer();
    this.heartbeatTimer = window.setInterval(() => {
      const sent = this.sendEnvelope('ping', { clientTime: Date.now() });
      if (!sent) {
        return;
      }
      this.updateState('connected');
      this.armPongTimeout();
    }, this.config.heartbeatIntervalMs);
  }

  private armPongTimeout(): void {
    this.clearPongTimer();
    this.pongTimer = window.setTimeout(() => {
      this.updateState('stale');
      if (this.socket) {
        this.socket.close();
      } else {
        this.updateState('disconnected');
        this.scheduleReconnect();
      }
    }, this.config.pongTimeoutMs);
  }

  private scheduleReconnect(): void {
    if (this.manualClose || !this.config.enabled) {
      return;
    }
    if (this.reconnectTimer !== null) {
      return;
    }
    const delay = Math.min(
      this.config.reconnectMaxMs,
      this.config.reconnectBaseMs * 2 ** this.reconnectAttempt
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearPongTimer(): void {
    if (this.pongTimer !== null) {
      window.clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private updateState(nextState: RealtimeConnectionState): void {
    if (this.state === nextState) {
      return;
    }
    this.state = nextState;
    this.stateListeners.forEach((listener) => listener(nextState));
  }

  private report(message: string, detail?: unknown): void {
    if (!this.config.reporter) {
      return;
    }
    this.config.reporter.report({
      type: 'error',
      data: {
        type: 'js',
        message: `[WsRealtimeClient] ${message}`,
        filename: this.config.url,
        lineno: 0,
        colno: 0,
        custom: {
          category: 'realtime-ws',
          metadata: {
            detail,
            sourceId: this.config.sourceId,
            state: this.state,
          },
        },
      },
      timestamp: new Date().toISOString(),
    });
  }
}

export function createWsRealtimeClient(config: WsClientConfig): WsRealtimeClient {
  return new WsRealtimeClient(config);
}
