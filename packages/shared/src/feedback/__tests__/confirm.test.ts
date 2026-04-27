/**
 * Confirm 服务测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirm } from '../confirm';

const mockModal = {
  confirm: vi.fn(),
};

vi.mock('ant-design-vue', () => ({
  Modal: mockModal,
}));

describe('Confirm 服务', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('show', () => {
    it('显示确认对话框', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      confirm.show({
        title: '确认操作',
        content: '是否继续？',
        onConfirm,
        onCancel,
      });

      expect(mockModal.confirm).toHaveBeenCalledWith({
        title: '确认操作',
        content: '是否继续？',
        okText: '确认',
        cancelText: '取消',
        okType: 'primary',
        onOk: onConfirm,
        onCancel,
      });
    });

    it('支持自定义按钮文本', () => {
      const onConfirm = vi.fn();

      confirm.show({
        title: '确认操作',
        content: '是否继续？',
        okText: '好的',
        cancelText: '不了',
        onConfirm,
      });

      expect(mockModal.confirm).toHaveBeenCalledWith({
        title: '确认操作',
        content: '是否继续？',
        okText: '好的',
        cancelText: '不了',
        okType: 'primary',
        onOk: onConfirm,
        onCancel: undefined,
      });
    });

    it('支持危险操作样式', () => {
      const onConfirm = vi.fn();

      confirm.show({
        title: '危险操作',
        content: '此操作不可撤销',
        danger: true,
        onConfirm,
      });

      expect(mockModal.confirm).toHaveBeenCalledWith({
        title: '危险操作',
        content: '此操作不可撤销',
        okText: '确认',
        cancelText: '取消',
        okType: 'danger',
        onOk: onConfirm,
        onCancel: undefined,
      });
    });
  });

  describe('delete', () => {
    it('显示删除确认对话框', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      confirm.delete('用户数据', onConfirm, onCancel);

      expect(mockModal.confirm).toHaveBeenCalledWith({
        title: '确认删除 用户数据？',
        content: '此操作不可撤销，请谨慎操作。',
        okText: '确认',
        cancelText: '取消',
        okType: 'danger',
        onOk: onConfirm,
        onCancel,
      });
    });

    it('支持不传取消回调', () => {
      const onConfirm = vi.fn();

      confirm.delete('用户数据', onConfirm);

      expect(mockModal.confirm).toHaveBeenCalledWith({
        title: '确认删除 用户数据？',
        content: '此操作不可撤销，请谨慎操作。',
        okText: '确认',
        cancelText: '取消',
        okType: 'danger',
        onOk: onConfirm,
        onCancel: undefined,
      });
    });
  });

  describe('batchDelete', () => {
    it('显示批量删除确认对话框', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      confirm.batchDelete(5, onConfirm, onCancel);

      expect(mockModal.confirm).toHaveBeenCalledWith({
        title: '确认删除选中的 5 项？',
        content: '此操作不可撤销，请谨慎操作。',
        okText: '确认',
        cancelText: '取消',
        okType: 'danger',
        onOk: onConfirm,
        onCancel,
      });
    });

    it('支持不传取消回调', () => {
      const onConfirm = vi.fn();

      confirm.batchDelete(3, onConfirm);

      expect(mockModal.confirm).toHaveBeenCalledWith({
        title: '确认删除选中的 3 项？',
        content: '此操作不可撤销，请谨慎操作。',
        okText: '确认',
        cancelText: '取消',
        okType: 'danger',
        onOk: onConfirm,
        onCancel: undefined,
      });
    });
  });
});
