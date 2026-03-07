/**
 * 错误收集器
 * 文件路径：packages/monitor/src/plugins/error.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 */

import type { Reporter } from '../transport';
import type { ErrorData } from '../types';

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
 */
export interface ErrorPluginOptions {
  /**
   * 📌 是否收集 JS 堆栈信息（可能包含敏感数据）
   * @default false
   */
  withStack?: boolean;
}

/**
 * 📌 设置错误拦截器
 * @param reporter Reporter 实例，用于上报错误数据
 * @param options 错误收集器配置选项
 * @description
 *  1. window.addEventListener('error', ...) - 拦截所有错误
 *  2. window.addEventListener('unhandledrejection', ...) - 拦截未处理的 Promise 异常
 *  3. window.addEventListener('error', fn, true) - 通过捕获阶段拦截资源加载错误
 */
export function setupErrorCatch(
  reporter: Reporter,
  options: ErrorPluginOptions = {}
): void {
  const { withStack = false } = options;

  /**
   * 📌 第一层：全局错误拦截（window.onerror）
   * @description 拦截所有 JS 运行时错误和静态资源加载错误
   */
  // ✅ 保持 window.onerror 简单实现，忽略复杂类型冲突
  const originalOnError = window.onerror;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.onerror as any) = function (
    message: string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error | null
  ): void {
    // ✅ 调用原始的 onerror（如果存在）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (originalOnError) {
      originalOnError.call(window, message, source, lineno, colno, error as any);
    }

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
  };

  /**
   * 📌 第二层：Promise 异常拦截（unhandledrejection）
   * @description 拦截未处理的 Promise reject
   */
  window.addEventListener('unhandledrejection', function (
    event: PromiseRejectionEvent
  ): void {
    const reason = event.reason;

    // ✅ 构建 Promise 异常数据
    const errorData: ErrorData = {
      type: 'js' as const,
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
      appId: 'admin',
    });
  });

  /**
   * 📌 第三层：资源加载错误拦截（事件捕获 phase）
   * @description 通过 capture phase 拦截资源加载错误（img/script/link）
   */
  window.addEventListener(
    'error',
    function (event: Event) {
      const target = event.target as (HTMLElement & { src?: string; href?: string });

      // ✅ 仅处理资源加载错误（排除 JS 错误）
      if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const errorData: ErrorData = {
          type: 'resource' as const,
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
    },
    true // ✅ 使用 capture phase 捕获事件
  );
}

/**
 * 📌 构建错误数据（内部工具函数）
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
    type: type === ErrorType.JS ? 'js' : 'resource',
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
