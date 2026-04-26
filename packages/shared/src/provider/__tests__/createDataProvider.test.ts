/**
 * createDataProvider 测试
 * 文件职责：验证 auto/api/mock 模式选择和闭环核心行为。
 */

import { describe, expect, it, vi } from 'vitest';
import { createDataProvider } from '../createDataProvider';

describe('createDataProvider', () => {
  it('auto 模式在探测失败时应回退到 mock', async () => {
    const provider = await createDataProvider({
      mode: 'auto',
      fetchImpl: vi.fn(async () => {
        throw new Error('network down');
      }) as unknown as typeof fetch,
      now: () => 1710000000000,
    });

    expect(provider.runtimeStatus.resolvedMode).toBe('mock');
    expect(provider.runtimeStatus.sourceLabel).toBe('模拟数据');
  });

  it('auto 模式在探测成功时应选择 api', async () => {
    const provider = await createDataProvider({
      mode: 'auto',
      fetchImpl: vi.fn(async () => new Response(null, { status: 200 })) as unknown as typeof fetch,
      now: () => 1710000000000,
    });

    expect(provider.runtimeStatus.resolvedMode).toBe('api');
    expect(provider.runtimeStatus.sourceLabel).toBe('真实接口');
  });

  it('确认告警后应返回更新结果并可重新拉取快照', async () => {
    const provider = await createDataProvider({
      mode: 'mock',
      now: () => Date.now(),
    });

    const snapshot = await provider.getDashboardSnapshot({ lineId: 'all', timeRange: '1h' });
    expect(snapshot.alerts.length).toBeGreaterThan(0);

    const firstAlert = snapshot.alerts[0];
    if (!firstAlert) {
      throw new Error('expected at least one alert');
    }

    const ackResult = await provider.acknowledgeAlert({ alertId: firstAlert.id, operator: 'test' });
    expect(ackResult.alert?.status).toBe('acknowledged');
    expect(ackResult.timeline?.type).toBe('alert-ack');

    const nextSnapshot = await provider.getDashboardSnapshot({ lineId: 'all', timeRange: '1h' });
    expect(nextSnapshot.timeline.length).toBeGreaterThan(0);
  });
});
