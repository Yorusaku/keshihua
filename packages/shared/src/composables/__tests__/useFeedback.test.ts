/**
 * useFeedback.withLoading 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from '../../feedback/toast';
import { useFeedback } from '../useFeedback';

const { hideLoading } = vi.hoisted(() => ({ hideLoading: vi.fn() }));

vi.mock('../../feedback/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(() => hideLoading),
  },
}));

describe('useFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('接受 Promise 并返回结果', async () => {
    const { withLoading } = useFeedback();

    const result = await withLoading(Promise.resolve('ok'), '加载中...');

    expect(result).toBe('ok');
    expect(toast.loading).toHaveBeenCalledWith('加载中...');
    expect(hideLoading).toHaveBeenCalledTimes(1);
  });

  it('接受任务函数并同步 submitting ref', async () => {
    const { withLoading } = useFeedback();
    const submitting = { value: false };
    let observedWhileRunning = false;
    const task = vi.fn(async () => {
      observedWhileRunning = submitting.value;
      return 42;
    });

    const result = await withLoading(task, submitting, '提交中...');

    expect(task).toHaveBeenCalledTimes(1);
    expect(observedWhileRunning).toBe(true);
    expect(submitting.value).toBe(false);
    expect(toast.loading).toHaveBeenCalledWith('提交中...');
    expect(result).toBe(42);
  });

  it('任务失败时重置 submitting ref 并继续抛出错误', async () => {
    const { withLoading } = useFeedback();
    const submitting = { value: false };

    await expect(
      withLoading(async () => {
        throw new Error('提交失败');
      }, submitting, '提交中...')
    ).rejects.toThrow('提交失败');

    expect(submitting.value).toBe(false);
    expect(hideLoading).toHaveBeenCalledTimes(1);
  });
});