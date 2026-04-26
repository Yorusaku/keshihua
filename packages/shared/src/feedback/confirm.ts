/**
 * 确认对话框服务
 * 基于 Ant Design Vue Modal.confirm API
 */

import { Modal } from 'ant-design-vue';
import type { ConfirmOptions } from './types';

/**
 * 显示确认对话框
 */
export function showConfirm(options: ConfirmOptions): void {
  Modal.confirm({
    title: options.title,
    content: options.content,
    okText: options.okText || '确认',
    cancelText: options.cancelText || '取消',
    okType: options.danger ? 'danger' : 'primary',
    onOk: options.onConfirm,
    onCancel: options.onCancel,
  });
}

/**
 * 显示删除确认对话框
 */
export function confirmDelete(
  itemName: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void
): void {
  showConfirm({
    title: `确认删除 ${itemName}？`,
    content: '此操作不可撤销，请谨慎操作。',
    danger: true,
    onConfirm,
    onCancel,
  });
}

/**
 * 显示批量删除确认对话框
 */
export function confirmBatchDelete(
  count: number,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void
): void {
  showConfirm({
    title: `确认删除选中的 ${count} 项？`,
    content: '此操作不可撤销，请谨慎操作。',
    danger: true,
    onConfirm,
    onCancel,
  });
}

/**
 * 确认服务对象
 */
export const confirm = {
  show: showConfirm,
  delete: confirmDelete,
  batchDelete: confirmBatchDelete,
};
