/**
 * Toast 通知服务
 * 基于 Ant Design Vue message API
 */

import { message } from 'ant-design-vue';
import type { ToastOptions } from './types';

/**
 * 显示成功提示
 */
export function showSuccess(content: string, duration = 3): void {
  message.success(content, duration);
}

/**
 * 显示错误提示
 */
export function showError(content: string, duration = 3): void {
  message.error(content, duration);
}

/**
 * 显示警告提示
 */
export function showWarning(content: string, duration = 3): void {
  message.warning(content, duration);
}

/**
 * 显示信息提示
 */
export function showInfo(content: string, duration = 3): void {
  message.info(content, duration);
}

/**
 * 显示加载提示
 * @returns 关闭函数
 */
export function showLoading(content: string, duration = 0): () => void {
  return message.loading(content, duration);
}

/**
 * Toast 服务对象
 */
export const toast = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
};
