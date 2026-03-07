/**
 * 队列与上报器
 * 文件路径：packages/monitor/src/transport.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 */

import type { ReportData } from './types';

/**
 * 📌 Reporter 配置
 */
export interface ReporterOptions {
  /**
   * 📌 上报地址
   */
  dsn: string;

  /**
   * 📌 应用标识
   */
  appId: string;

  /**
   * 📌 批量上报间隔（毫秒）
   * @default 5000
   */
  flushInterval?: number;

  /**
   * 📌 队列最大缓存数量
   * @default 100
   */
  maxQueueSize?: number;

  /**
   * 📌 是否启用调试模式
   * @default false
   */
  debug?: boolean;
}

/**
 * 📌 Reporter 实例
 */
export class Reporter {
  private readonly dsn: string;
  private readonly appId: string;
  private readonly flushInterval: number;
  private readonly maxQueueSize: number;
  private readonly debug: boolean;

  // ✅ 内存队列（存储待上报的数据）
  private queue: ReportData[] = [];

  // ✅ 定时器（用于批量上报）
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  // ✅ 标记是否已关闭
  private closed = false;

  /**
   * 📌 构造函数
   */
  constructor(options: ReporterOptions) {
    this.dsn = options.dsn;
    this.appId = options.appId;
    this.flushInterval = options.flushInterval || 5000;
    this.maxQueueSize = options.maxQueueSize || 100;
    this.debug = options.debug || false;

    // ✅ 启动批量上报定时器
    this.startFlushTimer();
  }

  /**
   * 📌 上报数据（核心方法）
   * @param data 上报数据
   * @description
   *  1. 将数据推入队列
   *  2. 如果队列满，立即触发上报
   *  3. 如果数据量少，等待 flushInterval 后批量上报
   */
  public report(data: ReportData): void {
    if (this.closed) {
      if (this.debug) {
        console.warn('[Monitor] Reporter is closed, ignoring report');
      }
      return;
    }

    // ✅ 添加 appId（全局配置）
    const reportData: ReportData = {
      ...data,
      appId: this.appId,
    };

    // ✅ 推入队列
    this.queue.push(reportData);

    // ✅ 调试日志
    if (this.debug) {
      console.log('[Monitor] Report queued:', reportData.type, reportData.data);
    }

    // ✅ 如果队列已满，立即触发上报
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * 📌 批量上报（核心方法）
   * @description
   *  1. 提取队列数据
   *  2. 清空队列
   *  3. 优先使用 sendBeacon
   *  4. 降级使用 fetch + keepalive
   */
  private flush(): void {
    if (this.queue.length === 0) {
      return;
    }

    // ✅ 提取队列数据
    const batch = [...this.queue];
    this.queue = [];

    // ✅ 调试日志
    if (this.debug) {
      console.log('[Monitor] Flushing batch:', batch.length, 'items');
    }

    // ✅ 尝试使用 sendBeacon（优先级最高）
    if (navigator.sendBeacon && typeof navigator.sendBeacon === 'function') {
      const success = this.sendWithBeacon(batch);
      if (success) {
        return;
      }
    }

    // ✅ 降级使用 fetch + keepalive
    this.sendWithFetch(batch);
  }

  /**
   * 📌 使用 sendBeacon 上报（优先策略）
   * @param batch 批量数据
   * @returns 是否上报成功
   * @description
   *  1. 将数据序列化为 JSON 字符串
   *  2. 使用 Blob 包装（sendBeacon 需要）
   *  3. 调用 navigator.sendBeacon
   *  4. 返回成功/失败状态
   */
  private sendWithBeacon(batch: ReportData[]): boolean {
    try {
      const payload = JSON.stringify(batch);
      const blob = new Blob([payload], { type: 'application/json' });

      // ✅ sendBeacon 返回 boolean（成功/失败）
      const success = navigator.sendBeacon(this.dsn, blob);

      if (this.debug) {
        console.log('[Monitor] sendBeacon result:', success);
      }

      return success;
    } catch (error) {
      if (this.debug) {
        console.error('[Monitor] sendBeacon failed:', error);
      }
      return false;
    }
  }

  /**
   * 📌 使用 fetch + keepalive 上报（降级策略）
   * @param batch 批量数据
   * @description
   *  1. 将数据序列化为 JSON 字符串
   *  2. 使用 fetch 发送 POST 请求
   *  3. 设置 keepalive: true（保证页面卸载时仍可发送）
   *  4. 设置 headers: 'application/json'
   */
  private sendWithFetch(batch: ReportData[]): void {
    const payload = JSON.stringify(batch);

    // ✅ 使用 fetch 发送请求（keepalive: true）
    fetch(this.dsn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
      keepalive: true, // ✅ 关键：保证页面卸载时仍可发送
    }).then(
      (response) => {
        if (this.debug) {
          console.log('[Monitor] fetch success:', response.status);
        }
      },
      (error) => {
        if (this.debug) {
          console.error('[Monitor] fetch failed:', error);
        }
      }
    );
  }

  /**
   * 📌 启动批量上报定时器
   * @description
   *  1. 使用 setTimeout 定时触发 flush
   *  2. 每次 flush 后重新设置定时器（循环）
   */
  private startFlushTimer(): void {
    const flush = () => {
      if (this.closed) {
        return;
      }

      this.flush();
      this.flushTimer = setTimeout(flush, this.flushInterval);
    };

    this.flushTimer = setTimeout(flush, this.flushInterval);
  }

  /**
   * 📌 关闭 Reporter（停止队列处理）
   * @description
   *  1. 清空定时器
   *  2. 最后触发一次 flush（上报剩余数据）
   *  3. 标记 closed = true
   */
  public close(): void {
    this.closed = true;

    // ✅ 清空定时器
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // ✅ 最后触发一次 flush（上报剩余数据）
    this.flush();
  }
}
