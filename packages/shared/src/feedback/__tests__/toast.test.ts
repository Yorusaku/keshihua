/**
 * Toast 服务测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from '../toast';

const mockMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  loading: vi.fn(() => vi.fn()),
};

vi.mock('ant-design-vue', () => ({
  message: mockMessage,
}));

describe('Toast 服务', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('显示成功提示', () => {
      toast.success('操作成功');
      expect(mockMessage.success).toHaveBeenCalledWith('操作成功', 3);
    });

    it('支持自定义持续时间', () => {
      toast.success('操作成功', 5);
      expect(mockMessage.success).toHaveBeenCalledWith('操作成功', 5);
    });
  });

  describe('error', () => {
    it('显示错误提示', () => {
      toast.error('操作失败');
      expect(mockMessage.error).toHaveBeenCalledWith('操作失败', 3);
    });

    it('支持自定义持续时间', () => {
      toast.error('操作失败', 5);
      expect(mockMessage.error).toHaveBeenCalledWith('操作失败', 5);
    });
  });

  describe('warning', () => {
    it('显示警告提示', () => {
      toast.warning('请注意');
      expect(mockMessage.warning).toHaveBeenCalledWith('请注意', 3);
    });
  });

  describe('info', () => {
    it('显示信息提示', () => {
      toast.info('提示信息');
      expect(mockMessage.info).toHaveBeenCalledWith('提示信息', 3);
    });
  });

  describe('loading', () => {
    it('显示加载提示', () => {
      toast.loading('加载中...');
      expect(mockMessage.loading).toHaveBeenCalledWith('加载中...', 0);
    });

    it('返回关闭函数', () => {
      const close = toast.loading('加载中...');
      expect(close).toBeInstanceOf(Function);
    });
  });
});
