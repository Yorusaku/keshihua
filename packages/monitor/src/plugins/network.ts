/**
 * 网络监控插件（任务四：Fetch 非 2xx 错误拦截）
 * 文件路径：@packages/monitor/src/plugins/network.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 核心功能：
 * - Monkey Patch（猴子补丁）重写 window.fetch
 * - 拦截所有网络请求的响应状态码
 * - 上报非 2xx 状态码（4xx/5xx）和超时错误
 * - 支持自定义上报过滤逻辑
 */

import type { Reporter } from '../transport';

/**
 * 📌 网络监控配置
 */
export interface NetworkPluginOptions {
  /**
   * 📌 是否启用调试模式（打印日志）
   * @default false
   */
  debug?: boolean;

  /**
   * 📌 自定义过滤函数（可选）
   * @param url 请求 URL
   * @param options fetch 选项
   * @returns true: 上报, false: 忽略
   * @description 用于过滤不需要上报的请求（如健康检查、心跳等）
   */
  filter?: (url: string, options?: RequestInit) => boolean;

  /**
   * 📌 超时阈值（毫秒）
   * @default 30000 (30秒)
   * @description 超过此时间未响应的请求将被标记为超时
   */
  timeout?: number;
}

/**
 * 📌 原生 fetch 的类型定义
 */
interface NativeFetch {
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

/**
 * 📌 设置网络监控插件
 * @param reporter Reporter 实例（用于上报数据）
 * @param options 网络监控配置
 * @returns 清理函数，调用后恢复原生 fetch
 * @description
 *  1. 保存原生 window.fetch 引用
 *  2. 重写 window.fetch（Monkey Patch）
 *  3. 拦截响应状态码（非 2xx 上报）
 *  4. 拦截超时错误
 *  5. 返回 teardown 函数用于恢复原生 fetch
 * @note 本函数具有 SSR 防御能力，在 Node.js/SSR 环境下会返回空清理函数
 * @note 建议在 initMonitor 中通过 config.network = true 开启
 * @example
 * ```ts
 * // 在 initMonitor 中启用
 * initMonitor({
 *   dsn: '/api/report',
 *   appId: 'dashboard',
 *   network: true, // ✅ 启用网络监控
 *   debug: import.meta.env.DEV,
 * });
 * ```
 */
export function setupNetworkMonitor(
  reporter: Reporter,
  options: NetworkPluginOptions = {}
): () => void {
  // ✅ SSR 防御：确保 window 和 fetch 可用
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return () => {}; // SSR 返回空函数
  }

  const { debug = false, filter, timeout = 30000 } = options;

  // ✅ 保存原生 fetch 引用（用于 teardown）
  const originalFetch: NativeFetch = window.fetch;

  // ✅ 记录未完成的请求（用于超时监控）
  const pendingRequests = new Map<
    number,
    { controller: AbortController; startTime: number; url: string }
  >();

  // ✅ 请求计数器（用于生成唯一 ID）
  let requestIdCounter = 0;

  /**
   * 📌 上报网络错误
   * @param url 请求 URL
   * @param duration 请求耗时（毫秒）
   * @param status HTTP 状态码
   * @param error 错误信息（可选）
   */
  const reportNetworkError = (
    url: string,
    duration: number,
    status?: number,
    error?: string
  ): void => {
    const errorData = {
      type: 'js' as const,
      message: error || `Network request failed: ${status || 'unknown'}`,
      filename: url,
      lineno: 0,
      colno: 0,
    };

    reporter.report({
      type: 'error',
      data: errorData,
      timestamp: new Date().toISOString(),
    });

    if (debug) {
      console.log(
        '[Monitor] Network error reported:',
        url,
        status,
        duration,
        error
      );
    }
  };

  // ✅ 重写 window.fetch（Monkey Patch）
  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : (input as Request).url || String(input);
    const startTime = Date.now();
    const requestId = ++requestIdCounter;

    // ✅ 检查过滤函数
    if (filter && !filter(url, init)) {
      // ✅ 过滤掉不需要监控的请求（如健康检查）
      if (debug) {
        console.log('[Monitor] Network request filtered:', url);
      }
      return originalFetch(input, init);
    }

    // ✅ 创建 AbortController（用于超时控制）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort('Fetch timeout');
    }, timeout);

    // ✅ 记录未完成的请求
    pendingRequests.set(requestId, {
      controller,
      startTime,
      url,
    });

    if (debug) {
      console.log('[Monitor] Network request started:', url, requestId);
    }

    try {
      // ✅ 调用原生 fetch
      const response = await originalFetch(input, {
        ...init,
        signal: controller.signal,
      });

      // ✅ 计算耗时
      const duration = Date.now() - startTime;

      // ✅ 清除超时定时器
      clearTimeout(timeoutId);
      pendingRequests.delete(requestId);

      // ✅ 检查响应状态码（非 2xx 上报）
      if (!response.ok) {
        const status = response.status;

        // ✅ 上报非 2xx 状态码错误
        reportNetworkError(
          url,
          duration,
          status,
          `HTTP Error ${status}: ${response.statusText}`
        );
      } else if (debug) {
        console.log(
          '[Monitor] Network request succeeded:',
          url,
          response.status,
          duration
        );
      }

      return response;
    } catch (error) {
      // ✅ 计算耗时
      const duration = Date.now() - startTime;

      // ✅ 清除超时定时器
      clearTimeout(timeoutId);
      pendingRequests.delete(requestId);

      // ✅ 判断错误类型
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // ✅ 超时错误
          reportNetworkError(
            url,
            duration,
            undefined,
            `Fetch timeout: ${timeout}ms`
          );
        } else {
          // ✅ 网络错误（如 DNS 解析失败、连接失败等）
          reportNetworkError(
            url,
            duration,
            undefined,
            error.message
          );
        }
      }

      throw error; // ✅ 重新抛出错误（保持原生 fetch 行为）
    }
  };

  if (debug) {
    console.log('[Monitor] Network monitor installed');
  }

  // ✅ 返回销毁函数
  return function teardownNetworkMonitor(): void {
    // ✅ 恢复原生 fetch
    window.fetch = originalFetch;

    // ✅ 清除所有未完成的请求（防止内存泄漏）
    pendingRequests.forEach(({ controller }) => {
      if (!controller.signal.aborted) {
        controller.abort('Monitor teardown');
      }
    });
    pendingRequests.clear();

    if (debug) {
      console.log('[Monitor] Network monitor torn down');
    }
  };
}
