/**
 * 通知中心服务
 * 基于 Ant Design Vue notification API
 */

import { notification } from 'ant-design-vue';
import type { NotificationOptions } from './types';

/**
 * 显示成功通知
 */
export function notifySuccess(
  message: string,
  description?: string,
  duration = 4.5
): void {
  notification.success({
    message,
    description,
    duration,
    placement: 'topRight',
  });
}

/**
 * 显示错误通知
 */
export function notifyError(
  message: string,
  description?: string,
  duration = 4.5
): void {
  notification.error({
    message,
    description,
    duration,
    placement: 'topRight',
  });
}

/**
 * 显示警告通知
 */
export function notifyWarning(
  message: string,
  description?: string,
  duration = 4.5
): void {
  notification.warning({
    message,
    description,
    duration,
    placement: 'topRight',
  });
}

/**
 * 显示信息通知
 */
export function notifyInfo(
  message: string,
  description?: string,
  duration = 4.5
): void {
  notification.info({
    message,
    description,
    duration,
    placement: 'topRight',
  });
}

/**
 * 通知服务对象
 */
export const notify = {
  success: notifySuccess,
  error: notifyError,
  warning: notifyWarning,
  info: notifyInfo,
};
