/**
 * 反馈系统主入口
 * 统一导出 toast、notification、confirm 服务
 */

export { toast } from './toast';
export { notify } from './notification';
export { confirm } from './confirm';
export type { ToastOptions, NotificationOptions, ConfirmOptions } from './types';

/**
 * 反馈服务对象（统一导出）
 */
import { toast } from './toast';
import { notify } from './notification';
import { confirm } from './confirm';

export const feedbackService = {
  toast,
  notify,
  confirm,
};
