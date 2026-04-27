/**
 * 告警处理完整流程集成测试
 * 测试从告警创建到关闭的完整生命周期
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockFactoryRuntime } from '../../provider/mockRuntime';
import { createAlertSyncBus } from '../../websocket/AlertSyncBus';
import type { SensorAlertItem } from '../../provider/types';

describe('告警处理完整流程', () => {
  let runtime: MockFactoryRuntime;
  let alertSyncBus: ReturnType<typeof createAlertSyncBus>;
  let existingAlertId: string;

  beforeEach(() => {
    runtime = new MockFactoryRuntime();
    alertSyncBus = createAlertSyncBus();

    // 获取一个存在的告警 ID
    const alertsResult = runtime.getAlertHistory({
      current: 1,
      pageSize: 1,
    });
    existingAlertId = alertsResult.list[0]?.id || '';
  });

  it('完整的告警处理流程：分配 → 处理 → 关闭', () => {
    const alertId = existingAlertId;

    // 1. 分配告警
    const assignResult = runtime.assignAlert({
      alertId,
      assignedTo: 'user-001',
      assignedBy: 'admin',
      note: '请尽快处理',
    });

    expect(assignResult.alert.processingStatus).toBe('assigned');
    expect(assignResult.alert.assignedTo).toBe('user-001');
    expect(assignResult.alert.processRecords).toHaveLength(1);
    expect(assignResult.alert.processRecords?.[0].action).toBe('assign');

    // 2. 添加根因分析
    const analyzeResult = runtime.updateAlertProcess({
      alertId,
      operator: 'user-001',
      action: 'analyze',
      content: '根因：传感器故障',
    });

    expect(analyzeResult.alert.processingStatus).toBe('in_progress');
    expect(analyzeResult.alert.processRecords).toHaveLength(2);
    expect(analyzeResult.alert.processRecords?.[0].action).toBe('analyze');

    // 3. 添加处理措施
    const actionResult = runtime.updateAlertProcess({
      alertId,
      operator: 'user-001',
      action: 'action',
      content: '已更换传感器',
    });

    expect(actionResult.alert.processingStatus).toBe('in_progress');
    expect(actionResult.alert.processRecords).toHaveLength(3);

    // 4. 关闭告警
    const closeResult = runtime.closeAlert({
      alertId,
      operator: 'user-001',
      resolution: '问题已解决',
      rootCause: '传感器故障',
      actionTaken: '更换新传感器',
    });

    expect(closeResult.alert.status).toBe('resolved');
    expect(closeResult.alert.processingStatus).toBe('completed');
    expect(closeResult.alert.mttr).toBeGreaterThanOrEqual(0);
    expect(closeResult.alert.processRecords).toHaveLength(4);

    // 5. 验证处理记录
    const processRecords = closeResult.alert.processRecords || [];
    const actions = processRecords.map(r => r.action);
    expect(actions).toContain('assign');
    expect(actions).toContain('analyze');
    expect(actions).toContain('action');
    expect(actions).toContain('close');
  });

  it('告警统计正确反映处理状态', () => {
    const alertId = existingAlertId;

    // 初始统计
    const initialStats = runtime.getAlertStatistics({});
    const initialActiveCount = initialStats.activeCount;

    // 分配并关闭告警
    runtime.assignAlert({
      alertId,
      assignedTo: 'user-001',
      assignedBy: 'admin',
    });

    runtime.closeAlert({
      alertId,
      operator: 'user-001',
      resolution: '已处理',
    });

    // 验证统计更新
    const updatedStats = runtime.getAlertStatistics({});
    expect(updatedStats.resolvedCount).toBeGreaterThan(initialStats.resolvedCount);
    expect(updatedStats.activeCount).toBeLessThan(initialActiveCount);
  });

  it('告警历史查询反映处理进度', () => {
    const alertId = existingAlertId;

    // 分配告警
    runtime.assignAlert({
      alertId,
      assignedTo: 'user-001',
      assignedBy: 'admin',
    });

    // 查询已分配的告警
    const assignedAlerts = runtime.getAlertHistory({
      current: 1,
      pageSize: 10,
      processingStatus: 'assigned',
    });

    const foundAlert = assignedAlerts.list.find(a => a.id === alertId);
    expect(foundAlert).toBeDefined();
    expect(foundAlert?.processingStatus).toBe('assigned');
    expect(foundAlert?.assignedTo).toBe('user-001');
  });

  it('多个告警并发处理', () => {
    // 获取多个告警
    const alerts = runtime.getAlertHistory({
      current: 1,
      pageSize: 3,
    });

    expect(alerts.list.length).toBeGreaterThanOrEqual(2);

    const alert1Id = alerts.list[0].id;
    const alert2Id = alerts.list[1].id;

    // 并发分配
    const assign1 = runtime.assignAlert({
      alertId: alert1Id,
      assignedTo: 'user-001',
      assignedBy: 'admin',
    });

    const assign2 = runtime.assignAlert({
      alertId: alert2Id,
      assignedTo: 'user-002',
      assignedBy: 'admin',
    });

    expect(assign1.alert.assignedTo).toBe('user-001');
    expect(assign2.alert.assignedTo).toBe('user-002');

    // 验证两个告警独立处理
    expect(assign1.alert.id).not.toBe(assign2.alert.id);
  });
});
