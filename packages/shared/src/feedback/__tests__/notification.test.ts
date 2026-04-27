/**
 * Notification 服务测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notify } from '../notification';

const mockNotification = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock('ant-design-vue', () => ({
  notification: mockNotification,
}));

describe('Notification 服务', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('显示成功通知', () => {
      notify.success('操作成功', '数据已保存');
      expect(mockNotification.success).toHaveBeenCalledWith({
        message: '操作成功',
        description: '数据已保存',
        duration: 4.5,
        placement: 'topRight',
      });
    });

    it('支持不传描述', () => {
      notify.success('操作成功');
      expect(mockNotification.success).toHaveBeenCalledWith({
        message: '操作成功',
        description: undefined,
        duration: 4.5,
        placement: 'topRight',
      });
    });

    it('支持自定义持续时间', () => {
      notify.success('操作成功', '数据已保存', 10);
      expect(mockNotification.success).toHaveBeenCalledWith({
        message: '操作成功',
        description: '数据已保存',
        duration: 10,
        placement: 'topRight',
      });
    });
  });

  describe('error', () => {
    it('显示错误通知', () => {
      notify.error('操作失败', '网络连接失败');
      expect(mockNotification.error).toHaveBeenCalledWith({
        message: '操作失败',
        description: '网络连接失败',
        duration: 4.5,
        placement: 'topRight',
      });
    });
  });

  describe('warning', () => {
    it('显示警告通知', () => {
      notify.warning('请注意', '数据即将过期');
      expect(mockNotification.warning).toHaveBeenCalledWith({
        message: '请注意',
        description: '数据即将过期',
        duration: 4.5,
        placement: 'topRight',
      });
    });
  });

  describe('info', () => {
    it('显示信息通知', () => {
      notify.info('提示', '系统将在 5 分钟后维护');
      expect(mockNotification.info).toHaveBeenCalledWith({
        message: '提示',
        description: '系统将在 5 分钟后维护',
        duration: 4.5,
        placement: 'topRight',
      });
    });
  });
});
