/**
 * MockFactoryRuntime 测试
 * 测试模拟运行时的告警处理功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockFactoryRuntime } from '../mockRuntime';
import type { AlertProcessingStatus } from '../types';

describe('MockFactoryRuntime', () => {
  let runtime: MockFactoryRuntime;
  let existingAlertId: string;

  beforeEach(() => {
    runtime = new MockFactoryRuntime();

    // 获取一个存在的告警 ID 用于测试
    const alertsResult = runtime.getAlertHistory({
      current: 1,
      pageSize: 1,
    });
    existingAlertId = alertsResult.list[0]?.id || '';
  });

  describe('告警分配', () => {
    it('分配告警给责任人', () => {
      const result = runtime.assignAlert({
        alertId: existingAlertId,
        assignedTo: 'user-001',
        assignedBy: 'admin',
        note: '请尽快处理',
      });

      expect(result.alert.assignedTo).toBe('user-001');
      expect(result.alert.processingStatus).toBe('assigned');
    });

    it('分配不存在的告警返回错误', () => {
      expect(() => {
        runtime.assignAlert({
          alertId: 'non-existent',
          assignedTo: 'user-001',
          assignedBy: 'admin',
        });
      }).toThrow('告警不存在');
    });
  });

  describe('告警处理更新', () => {
    it('添加处理记录', () => {
      runtime.assignAlert({
        alertId: existingAlertId,
        assignedTo: 'user-001',
        assignedBy: 'admin',
      });

      const result = runtime.updateAlertProcess({
        alertId: existingAlertId,
        operator: 'user-001',
        action: 'analyze',
        content: '根因分析：传感器故障',
      });

      expect(result.alert.processRecords).toHaveLength(2);
      expect(result.alert.processRecords?.[0].action).toBe('analyze');
      expect(result.alert.processingStatus).toBe('in_progress');
    });

    it('更新不存在的告警返回错误', () => {
      expect(() => {
        runtime.updateAlertProcess({
          alertId: 'non-existent',
          operator: 'user-001',
          action: 'comment',
          content: '测试',
        });
      }).toThrow('告警不存在');
    });
  });

  describe('告警关闭', () => {
    it('关闭告警并计算 MTTR', () => {
      runtime.assignAlert({
        alertId: existingAlertId,
        assignedTo: 'user-001',
        assignedBy: 'admin',
      });

      const result = runtime.closeAlert({
        alertId: existingAlertId,
        operator: 'user-001',
        resolution: '已更换传感器',
        rootCause: '传感器老化',
        actionTaken: '更换新传感器',
      });

      expect(result.alert.status).toBe('resolved');
      expect(result.alert.processingStatus).toBe('completed');
      expect(result.alert.mttr).toBeGreaterThanOrEqual(0);
    });

    it('关闭不存在的告警返回错误', () => {
      expect(() => {
        runtime.closeAlert({
          alertId: 'non-existent',
          operator: 'user-001',
          resolution: '已处理',
        });
      }).toThrow('告警不存在');
    });
  });

  describe('告警历史查询', () => {
    it('查询所有告警', () => {
      const result = runtime.getAlertHistory({
        current: 1,
        pageSize: 10,
      });

      expect(result.list).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
    });

    it('按产线筛选', () => {
      const result = runtime.getAlertHistory({
        current: 1,
        pageSize: 10,
        lineId: 'line-a',
      });

      result.list.forEach((alert) => {
        expect(alert.lineId).toBe('line-a');
      });
    });

    it('按严重等级筛选', () => {
      const result = runtime.getAlertHistory({
        current: 1,
        pageSize: 10,
        severity: 'critical',
      });

      result.list.forEach((alert) => {
        expect(alert.severity).toBe('critical');
      });
    });

    it('按状态筛选', () => {
      const result = runtime.getAlertHistory({
        current: 1,
        pageSize: 10,
        status: 'active',
      });

      result.list.forEach((alert) => {
        expect(alert.status).toBe('active');
      });
    });

    it('按处理进度筛选', () => {
      const result = runtime.getAlertHistory({
        current: 1,
        pageSize: 10,
        processingStatus: 'unassigned',
      });

      result.list.forEach((alert) => {
        expect(alert.processingStatus).toBe('unassigned');
      });
    });

    it('按关键词搜索', () => {
      const result = runtime.getAlertHistory({
        current: 1,
        pageSize: 10,
        keyword: existingAlertId,
      });

      if (result.list.length > 0) {
        expect(result.list[0].id).toContain(existingAlertId);
      }
    });

    it('分页功能', () => {
      const page1 = runtime.getAlertHistory({
        current: 1,
        pageSize: 5,
      });

      const page2 = runtime.getAlertHistory({
        current: 2,
        pageSize: 5,
      });

      expect(page1.list.length).toBeGreaterThan(0);
      expect(page2.list.length).toBeGreaterThanOrEqual(0);
      if (page1.list.length > 0 && page2.list.length > 0) {
        expect(page1.list[0].id).not.toBe(page2.list[0].id);
      }
    });
  });

  describe('告警统计', () => {
    it('计算告警统计数据', () => {
      const result = runtime.getAlertStatistics({});

      expect(result.totalCount).toBeGreaterThan(0);
      expect(result.activeCount).toBeGreaterThanOrEqual(0);
      expect(result.resolvedCount).toBeGreaterThanOrEqual(0);
      expect(result.avgMttr).toBeGreaterThanOrEqual(0);
    });

    it('按产线统计', () => {
      const result = runtime.getAlertStatistics({
        lineId: 'line-a',
      });

      expect(result).toBeDefined();
    });

    it('MTTR 计算正确', () => {
      const result = runtime.getAlertStatistics({});

      if (result.resolvedCount > 0) {
        expect(result.avgMttr).toBeGreaterThan(0);
      }
    });
  });

  describe('责任人列表', () => {
    it('获取责任人列表', () => {
      const result = runtime.getAssignees();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('责任人包含必要字段', () => {
      const result = runtime.getAssignees();

      result.forEach((assignee) => {
        expect(assignee.id).toBeDefined();
        expect(assignee.name).toBeDefined();
        expect(assignee.role).toBeDefined();
      });
    });
  });

  describe('告警处理流程', () => {
    it('完整的告警处理流程', () => {
      const alertId = existingAlertId;

      // 1. 分配告警
      const assignResult = runtime.assignAlert({
        alertId,
        assignedTo: 'user-001',
        assignedBy: 'admin',
        note: '请尽快处理',
      });
      expect(assignResult.alert.processingStatus).toBe('assigned');

      // 2. 添加根因分析
      const analyzeResult = runtime.updateAlertProcess({
        alertId,
        operator: 'user-001',
        action: 'analyze',
        content: '根因：传感器故障',
      });
      expect(analyzeResult.alert.processingStatus).toBe('in_progress');

      // 3. 添加处理措施
      const actionResult = runtime.updateAlertProcess({
        alertId,
        operator: 'user-001',
        action: 'action',
        content: '已更换传感器',
      });
      expect(actionResult.alert.processingStatus).toBe('in_progress');

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

      // 5. 验证处理记录
      const processRecords = closeResult.alert.processRecords || [];
      expect(processRecords.length).toBeGreaterThanOrEqual(4);

      const actions = processRecords.map(r => r.action);
      expect(actions).toContain('assign');
      expect(actions).toContain('analyze');
      expect(actions).toContain('action');
      expect(actions).toContain('close');
    });
  });
});
