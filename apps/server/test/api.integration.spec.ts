import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://127.0.0.1:8091/api';
let token: string;
let adminId: string;
let testAgvId = 'AGV-INTEGRATION-TEST';
let testAlertId: string;

async function api(method: string, path: string, body?: any) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text(); const data = text ? JSON.parse(text) : null;
  return { status: res.status, data };
}

describe('Smart Manufacturing API Integration', () => {
  beforeAll(async () => {
    const res = await api('POST', '/auth/login', { username: 'admin', password: '123456' });
    expect(res.status).toBe(201);
    token = res.data.token;
    adminId = res.data.user.id;
  });

  describe('Auth', () => {
    it('should login successfully', async () => {
      const res = await api('POST', '/auth/login', { username: 'admin', password: '123456' });
      expect(res.status).toBe(201);
      expect(res.data.token).toBeDefined();
      expect(res.data.user.role).toBe('admin');
    });

    it('should reject invalid password', async () => {
      const res = await api('POST', '/auth/login', { username: 'admin', password: 'wrong' });
      expect(res.status).toBe(400);
    });

    it('should return current user', async () => {
      const res = await api('GET', '/auth/me');
      expect(res.status).toBe(200);
      expect(res.data.username).toBe('admin');
    });
  });

  describe('AGV CRUD', () => {
    it('should list AGVs with pagination', async () => {
      const res = await api('GET', '/agvs');
      expect(res.status).toBe(200);
      expect(res.data.total).toBeGreaterThanOrEqual(20);
      expect(res.data.list.length).toBeGreaterThan(0);
    });

    it('should create a new AGV', async () => {
      const res = await api('POST', '/agvs', {
        id: testAgvId, name: '集成测试AGV', lineId: 'line-a', zoneId: 'line-a-zone-1', status: 'idle', x: 0, y: 0,
      });
      expect(res.status).toBe(201);
      expect(res.data.id).toBe(testAgvId);
    });

    it('should update AGV status', async () => {
      const res = await api('PATCH', `/agvs/${testAgvId}`, { status: 'moving', battery: 80, speed: 25, task: '运输' });
      expect(res.status).toBe(200);
      expect(res.data.status).toBe('moving');
    });

    it('should delete AGV', async () => {
      const res = await api('DELETE', `/agvs/${testAgvId}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Alert Lifecycle', () => {
    it('should create an alert', async () => {
      const res = await api('POST', '/alerts', {
        sensorId: 'TEST-SENSOR', lineId: 'line-a', title: '测试告警-集成测试',
        message: '集成测试告警', severity: 'high', threshold: 80, value: 95,
      });
      expect(res.status).toBe(201);
      expect(res.data.status).toBe('active');
      testAlertId = res.data.id;
    });

    it('should acknowledge alert', async () => {
      const res = await api('POST', `/alerts/${testAlertId}/acknowledge`);
      expect(res.status).toBe(201);
      expect(res.data.status).toBe('acknowledged');
    });

    it('should assign alert', async () => {
      const res = await api('POST', `/alerts/${testAlertId}/assign`, { assignedToId: adminId, version: 0 });
      expect(res.status).toBe(201);
      expect(res.data.processingStatus).toBe('in_progress');
    });

    it('should close alert and calculate MTTR', async () => {
      const res = await api('POST', `/alerts/${testAlertId}/close`, {
        rootCause: '集成测试', actionTaken: '修复', resolution: '已完成',
      });
      expect(res.status).toBe(201);
      expect(res.data.status).toBe('resolved');
      expect(res.data.mttr).toBeGreaterThan(0);
    });
  });

  describe('Capacity Report', () => {
    it('should return capacity data', async () => {
      const res = await api('GET', '/capacity/report');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
    });
  });

  describe('Production Lines', () => {
    it('should list production lines with zones', async () => {
      const res = await api('GET', '/production-lines');
      expect(res.status).toBe(200);
      expect(res.data.length).toBe(3);
      expect(res.data[0].zones.length).toBeGreaterThan(0);
    });
  });
});