/**
 * 反馈系统 Composable
 * 提供业务级封装，简化组件中的使用
 */

import { toast } from '../feedback/toast';
import { notify } from '../feedback/notification';
import { confirm } from '../feedback/confirm';
import type { ConfirmOptions } from '../feedback/types';

interface LoadingRef {
  value: boolean;
}

function isLoadingRef(value: unknown): value is LoadingRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    typeof (value as LoadingRef).value === 'boolean'
  );
}

/**
 * 使用反馈系统
 */
export function useFeedback() {
  /**
   * 带加载状态的异步操作
   * @param task 异步操作或返回异步操作的函数
   * @param loadingOrRef 加载提示文本，或用于同步 loading 状态的 ref
   * @param loadingText 传入 loading ref 时的提示文本
   * @returns Promise 结果
   */
  const withLoading = async <T>(
    task: Promise<T> | (() => Promise<T>),
    loadingOrRef: string | LoadingRef = '处理中...',
    loadingText?: string
  ): Promise<T> => {
    const loadingRef = isLoadingRef(loadingOrRef) ? loadingOrRef : null;
    const text = loadingRef
      ? loadingText || '处理中...'
      : typeof loadingOrRef === 'string'
        ? loadingOrRef
        : '处理中...';
    const hide = toast.loading(text);
    if (loadingRef) {
      loadingRef.value = true;
    }
    try {
      const result = await (typeof task === 'function' ? task() : task);
      hide();
      return result;
    } catch (error) {
      hide();
      throw error;
    } finally {
      if (loadingRef) {
        loadingRef.value = false;
      }
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
