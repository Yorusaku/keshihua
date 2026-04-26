/**
 * WebSocket 监控工具（任务二：WebSocket 异常与静默断连监控）
 * 文件路径：packages/shared/src/websocket/_monitorUtils.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 核心功能：
 * - 为 WebSocket 实例包装 MonitorableWebSocket 类
 * - 自动捕获 onerror 和 onclose 事件
 * - 支持自定义断连原因上报（防止静默断连）
 * - ⚠️ 循环依赖说明：@packages/shared 不能依赖 @packages/monitor
 *   因此 reporter 类型使用 any，实际使用时由调用方传递 Reporter 实例
 */

// ❌ import type { ReportData } from '@packages/monitor'; // ⚠️ 避免循环依赖

/**
 * 📌 监控后的 WebSocket 类
 * @description 包装原生 WebSocket，自动捕获错误和断连事件
 */
export class MonitorableWebSocket {
  private readonly socket: WebSocket;
  private readonly reporter: any; // ⚠️ 使用 any 避免循环依赖
  private readonly config: MonitorableWebSocketConfig;

  /**
   * 构造函数
   * @param url WebSocket 连接地址
   * @param reporter Reporter 实例（用于上报错误）
   * @param config 监控配置（可选）
   */
  constructor(
    url: string | URL,
    reporter: any, // ⚠️ 使用 any 避免循环依赖
    config?: MonitorableWebSocketConfig
  );

  /**
   * 构造函数（重载）
   * @param url WebSocket 连接地址
   * @param protocols WebSocket 子协议
   * @param reporter Reporter 实例（用于上报错误）
   * @param config 监控配置（可选）
   */
  constructor(
    url: string | URL,
    protocols?: string | string[],
    reporter?: any, // ⚠️ 使用 any 避免循环依赖
    config?: MonitorableWebSocketConfig
  );
  
  constructor(
    url: string | URL,
    arg2?: string | string[] | any,
    arg3?: any | MonitorableWebSocketConfig,
    arg4?: MonitorableWebSocketConfig
  ) {
    // ✅ 解析参数（兼容原生 WebSocket 构造函数）
    let protocols: string | string[] | undefined;
    let reporter: any; // ⚠️ 使用 any 避免循环依赖
    let config: MonitorableWebSocketConfig | undefined;

    if (arg2 !== undefined && typeof arg2 === 'object' && arg2.report && typeof arg2.report === 'function') {
      // URL, Reporter, Config
      reporter = arg2;
      config = arg3 as MonitorableWebSocketConfig | undefined;
    } else if (typeof arg2 === 'string' || Array.isArray(arg2)) {
      // URL, Protocols, Reporter, Config
      protocols = arg2;
      reporter = arg3;
      config = arg4 as MonitorableWebSocketConfig | undefined;
    }

    // ✅ 创建原生 WebSocket
    if (protocols && reporter) {
      this.socket = new WebSocket(url, protocols);
    } else if (reporter) {
      this.socket = new WebSocket(url);
    } else {
      throw new Error('Reporter is required for MonitorableWebSocket');
    }

    this.reporter = reporter!; // ⚠️ 确保 reporter 已定义
    this.config = {
      withStack: false,
      ...config,
    };

    // ✅ 包装事件监听器
    this.wrapEvents();
  }

  /**
   * 包装事件监听器（关键：捕获错误和断连）
   */
  private wrapEvents(): void {
    // ✅ 捕获 onerror 事件
    const originalOnError = this.socket.onerror;
    this.socket.onerror = (event: Event | string) => {
      const errorMessage = typeof event === 'string' ? event : 'WebSocket error occurred';

      // ✅ 上报 WebSocket 错误
      this.reporter.report({
        type: 'error',
        data: {
          type: 'js',
          message: `[WebSocket Error] ${errorMessage}`,
          filename: this.socket.url,
          lineno: 0,
          colno: 0,
          stack: this.config.withStack ? new Error(errorMessage).stack : undefined,
        },
        timestamp: new Date().toISOString(),
      });

      // ✅ 调用原始 onerror（如果存在）
      if (originalOnError) {
        // 类型安全：传入 Event 类型
        const nativeEvent = typeof event === 'string' ? new Event('error') : event;
        originalOnError.call(this.socket, nativeEvent as Event);
      }
    };

    // ✅ 捕获 onclose 事件（关键：判断是否为异常断连）
    const originalOnClose = this.socket.onclose;
    this.socket.onclose = (event: CloseEvent) => {
      // ✅ 判断是否为异常断连
      const isAbnormalClose = !event.wasClean;
      
      if (isAbnormalClose) {
        // ✅ 上报异常断连（含详细信息）
        const closeInfo = {
          code: event.code,
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean,
          timestamp: new Date().toISOString(),
        };

        this.reporter.report({
          type: 'error',
          data: {
            type: 'js',
            message: `[WebSocket Abnormal Close] Connection closed unexpectedly`,
            filename: this.socket.url,
            lineno: 0,
            colno: 0,
            stack: this.config.withStack ? new Error(JSON.stringify(closeInfo)).stack : undefined,
          },
          timestamp: new Date().toISOString(),
        });
      }

      // ✅ 调用原始 onclose（如果存在）
      if (originalOnClose) {
        originalOnClose.call(this.socket, event);
      }
    };
  }

  /**
   * 代理原生 WebSocket 方法
   */
  public addEventListener<K extends EventMapKey>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.socket.addEventListener(type, listener, options);
  }

  public removeEventListener<K extends EventMapKey>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void {
    this.socket.removeEventListener(type, listener, options);
  }

  public dispatchEvent(event: Event): boolean {
    return this.socket.dispatchEvent(event);
  }

  public close(code?: number, reason?: string): void {
    this.socket.close(code, reason);
  }

  public send(data: string | ArrayBuffer | Blob | ArrayBufferView): void {
    this.socket.send(data);
  }

  /**
   * 获取原生 WebSocket 实例（用于访问原生属性和方法）
   */
  public getNativeSocket(): WebSocket {
    return this.socket;
  }
}

/**
 * 📌 监控配置
 */
interface MonitorableWebSocketConfig {
  /**
   * 📌 是否包含堆栈信息（可能包含敏感数据）
   * @default false
   */
  withStack?: boolean;
}

/**
 * 📌 EventMap 类型（TypeScript 5.1+ 支持）
 * @description WebSocket 事件类型映射
 */
type EventMapKey = keyof WebSocketEventMap;
