/**
 * 错误收集器
 * 文件路径：packages/monitor/src/plugins/error.ts
 * 阶段：🟣 重构阶段（常量抽离 + SSR 防御 + TSDoc 补全 + 生命周期管理）
 */

import type { Reporter } from '../transport';
import type { ErrorData } from '../types';
import {
  ERROR_TYPE_JS,
  ERROR_TYPE_RESOURCE,
} from '../constants';

/**
 * 📌 错误类型枚举
 */
export enum ErrorType {
  JS = 'js',
  RESOURCE = 'resource',
  PROMISE = 'promise',
}

/**
 * 📌 错误收集器配置
 * @description 错误收集器的配置选项
 */
export interface ErrorPluginOptions {
  /**
   * 📌 是否收集 JS 堆栈信息（可能包含敏感数据）
   * @default false
   * @description 当设置为 true 时，会将 Error.stack 包含在上报数据中
   */
  withStack?: boolean;
}

/**
 * 📌 设置错误拦截器
 * @param reporter Reporter 实例，用于上报错误数据
 * @param options 错误收集器配置选项
 * @returns 清理函数，调用后恢复原生错误处理
 * @description
 *  1. window.onerror - 全局 JS 运行时错误拦截（并还原返回值）
 *  2. unhandledrejection - 未处理的 Promise 异常拦截
 *  3. window.addEventListener('error', fn, true) - 资源加载错误拦截（捕获阶段）
 * @note 本函数具有 SSR 防御能力，在 Node.js/SSR 环境下会返回空清理函数
 * @note 提供了 teardown 函数用于精确控制监听器的生命周期
 * @example
 * ```ts
 * const teardown = setupErrorCatch(reporter);
 * // ... 应用运行
 * teardown(); // ✅ 恢复原生错误处理，移除事件监听
 * ```
 */
export function setupErrorCatch(
  reporter: Reporter,
  options: ErrorPluginOptions = {}
): () => void {
  // ✅ SSR 防御：确保 window 可用
  if (typeof window === 'undefined') {
    return () => {}; // SSR 返回空函数
  }

  const { withStack = false } = options;

  // ✅ 保存原始的 onerror（用于 teardown）
  const originalOnError = window.onerror;

  // ✅ 第一层：全局错误拦截（window.onerror）
  /**
   * 📌 window.onerror 拦截器
   * @description 拦截所有 JS 运行时错误和静态资源加载错误
   */
  // 🔒 严格类型检查下 window.onerror 是 OnErrorEventHandler，但我们需要自定义处理
  // 使用类型断言绕过 TypeScript 的严格检查（这是安全的）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).onerror = function (
    message: string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error | null
  ): any {
    // ✅ 构建错误数据
    const errorData = buildErrorData(
      ErrorType.JS,
      String(message),
      source || '',
      lineno || 0,
      colno || 0,
      error || null,
      withStack
    );

    // ✅ 上报错误
    reporter.report({
      type: 'error',
      data: errorData,
      timestamp: new Date().toISOString(),
    });

    // ✅ 完美还原原生行为与返回值
    if (originalOnError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return originalOnError.apply(this, arguments as any);
    }
    return false; // ✅ 默认返回 false
  };

  // ✅ 第二层：Promise 异常拦截（unhandledrejection）
  /**
   * 📌 unhandledrejection 拦截器
   * @description 拦截未处理的 Promise reject
   */
  const onUnhandledRejection = function (
    event: PromiseRejectionEvent
  ): void {
    const reason = event.reason;

    // ✅ 构建 Promise 异常数据
    const errorData: ErrorData = {
      type: ERROR_TYPE_JS,
      message: reason instanceof Error ? reason.message : String(reason),
      filename: window.location.href,
      lineno: 0,
      colno: 0,
      error: reason instanceof Error ? reason.stack : String(reason),
    };

    // ✅ 上报错误
    reporter.report({
      type: 'error',
      data: errorData,
      timestamp: new Date().toISOString(),
    });
  };
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  // ✅ 第三层：资源加载错误拦截（事件捕获 phase）
  /**
   * 📌 资源错误拦截器（capture phase）
   * @description 通过 capture phase 拦截资源加载错误（img/script/link）
   */
  const onResourceError = function (event: Event) {
    const target = event.target as (HTMLElement & { src?: string; href?: string });

    // ✅ 仅处理资源加载错误（排除 JS 错误）
    if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      const errorData: ErrorData = {
        type: ERROR_TYPE_RESOURCE,
        message: `Resource load failed: ${target.src || target.href || target.getAttribute('src') || target.getAttribute('href') || ''}`,
        filename: target.src || target.href || target.getAttribute('src') || target.getAttribute('href') || '',
        lineno: 0,
        colno: 0,
      };

      reporter.report({
        type: 'error',
        data: errorData,
        timestamp: new Date().toISOString(),
      });
    }
  };
  window.addEventListener('error', onResourceError, true); // ✅ 使用 capture phase 捕获事件

  // ✅ 返回销毁函数
  return () => {
    // ✅ 恢复原生 onerror
    window.onerror = originalOnError;

    // ✅ 移除 unhandledrejection 监听
    window.removeEventListener('unhandledrejection', onUnhandledRejection);

    // ✅ 移除资源错误监听
    window.removeEventListener('error', onResourceError, true);
  };
}

/**
 * 📌 构建错误数据（内部工具函数）
 * @param type 错误类型
 * @param message 错误消息
 * @param source 错误文件路径
 * @param lineno 错误行号
 * @param colno 错误列号
 * @param error 错误对象
 * @param withStack 是否包含堆栈信息
 * @returns 构建好的 ErrorData 对象
 */
function buildErrorData(
  type: ErrorType,
  message: string,
  source: string,
  lineno: number,
  colno: number,
  error: Error | null,
  withStack: boolean
): ErrorData {
  const errorData: ErrorData = {
    type: type === ErrorType.JS ? ERROR_TYPE_JS : ERROR_TYPE_RESOURCE,
    message,
    filename: source,
    lineno,
    colno,
  };

  // ✅ 根据配置决定是否包含堆栈信息
  if (withStack && error && error.stack) {
    errorData.stack = error.stack;
  }

  return errorData;
}
