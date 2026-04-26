/**
 * 反馈系统 Composable
 * 提供业务级封装，简化组件中的使用
 */

import { toast } from '../feedback/toast';
import { notify } from '../feedback/notification';
import { confirm } from '../feedback/confirm';
import type { ConfirmOptions } from '../feedback/types';

/**
 * 使用反馈系统
 */
export function useFeedback() {
  /**
   * 带加载状态的异步操作
   * @param promise 异步操作
   * @param loadingText 加载提示文本
   * @returns Promise 结果
   */
  const withLoading = async <T>(
    promise: Promise<T>,
    loadingText = '处理中...'
  ): Promise<T> => {
    const hide = toast.loading(loadingText);
    try {
      const result = await promise;
      hide();
      return result;
    } catch (error) {
      hide();
      throw error;
    }
  };

  /**
   * 确认删除
   * @param itemName 项目名称
   * @param onConfirm 确认回调
   */
  const confirmDelete = (
    itemName: string,
    onConfirm: () => void | Promise<void>
  ): void => {
    confirm.delete(itemName, onConfirm);
  };

  /**
   * 确认批量删除
   * @param count 数量
   * @param onConfirm 确认回调
   */
  const confirmBatchDelete = (
    count: number,
    onConfirm: () => void | Promise<void>
  ): void => {
    confirm.batchDelete(count, onConfirm);
  };

  /**
   * 自定义确认对话框
   * @param options 确认选项
   */
  const showConfirm = (options: ConfirmOptions): void => {
    confirm.show(options);
  };

  return {
    // Toast
    toast,
    // Notification
    notify,
    // Confirm
    confirm: showConfirm,
    confirmDelete,
    confirmBatchDelete,
    // Helpers
    withLoading,
  };
}
