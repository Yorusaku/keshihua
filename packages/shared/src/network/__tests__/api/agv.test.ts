/**
 * fetchAgvList API 测试用例
 * 文件路径：packages/shared/src/network/__tests__/api/agv.test.ts
 * 阶段：🔴 红灯阶段（测试先行）
 *
 * 📌 测试说明：
 * - 测试 fetchAgvList 函数的默认分页逻辑
 * - 测试带 keyword 和 status 的过滤逻辑
 * - 测试 addAgv 函数的新增数据逻辑
 * - 红灯阶段：API 函数未实现，测试应全部失败
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAgvList, addAgv, mockAgvData } from '../../api/agv';
import type { IAgvListParams, IAgvListResponse, IAddAgvPayload, IAgvData } from '../../api/agv';
import { agvSyncBus } from '../../../websocket/AgvSyncBus';

// ✅ Mock agvSyncBus.broadcastNewAgv 方法
vi.spyOn(agvSyncBus, 'broadcastNewAgv');
vi.spyOn(agvSyncBus, 'broadcastNewAgvEnvelope');

describe('fetchAgvList - AGV List API', () => {
  describe('Default Pagination', () => {
    it('默认分页（page=1, pageSize=10）应返回前 10 条数据', async () => {
      const params: IAgvListParams = {
        current: 1,
        pageSize: 10,
        keyword: '',
        status: undefined,
      };

      // ✅ 预期：fetchAgvList 应返回 10 条数据，total 应 >= 10
      const result: IAgvListResponse = await fetchAgvList(params);

      expect(result.list).toHaveLength(10);
      expect(result.total).toBeGreaterThanOrEqual(10);
    });

    it('第二页（page=2, pageSize=10）应返回第 11-20 条数据', async () => {
      const params: IAgvListParams = {
        current: 2,
        pageSize: 10,
        keyword: '',
        status: undefined,
      };

      // ✅ 预期：fetchAgvList 应返回第 11-20 条数据
      const result: IAgvListResponse = await fetchAgvList(params);

      expect(result.list).toHaveLength(10);
      expect(result.total).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Keyword Filtering', () => {
    it('使用 keyword 过滤应返回匹配的 AGV 数据', async () => {
      const params: IAgvListParams = {
        current: 1,
        pageSize: 20,
        keyword: 'AGV-001',
        status: undefined,
      };

      // ✅ 预期：fetchAgvList 应只返回 id 包含 'AGV-001' 的数据
      const result: IAgvListResponse = await fetchAgvList(params);

      result.list.forEach((item) => {
        expect(item.id).toContain('AGV-001');
      });
    });

    it('空 keyword 应返回全部数据', async () => {
      const params: IAgvListParams = {
        current: 1,
        pageSize: 20,
        keyword: '',
        status: undefined,
      };

      // ✅ 预期：fetchAgvList 应返回全部数据
      const result: IAgvListResponse = await fetchAgvList(params);

      expect(result.total).toBeGreaterThanOrEqual(result.list.length);
    });
  });

  describe('Status Filtering', () => {
    it('使用 status 过滤应返回匹配的状态数据', async () => {
      const params: IAgvListParams = {
        current: 1,
        pageSize: 20,
        keyword: '',
        status: 'idle',
      };

      // ✅ 预期：fetchAgvList 应只返回 status 为 'idle' 的数据
      const result: IAgvListResponse = await fetchAgvList(params);

      result.list.forEach((item) => {
        expect(item.status).toBe('idle');
      });
    });

    it('status 过滤应与 keyword 过滤组合生效', async () => {
      const params: IAgvListParams = {
        current: 1,
        pageSize: 20,
        keyword: 'AGV-001',
        status: 'idle',
      };

      // ✅ 预期：fetchAgvList 应只返回 id 匹配且 status 为 'idle' 的数据
      const result: IAgvListResponse = await fetchAgvList(params);

      result.list.forEach((item) => {
        expect(item.id).toContain('AGV-001');
        expect(item.status).toBe('idle');
      });
    });
  });

  describe('Response Structure', () => {
    it('响应应包含 total 和 list 字段', async () => {
      const params: IAgvListParams = {
        current: 1,
        pageSize: 10,
      };

      // ✅ 预期：fetchAgvList 应返回包含 total 和 list 的对象
      const result: IAgvListResponse = await fetchAgvList(params);

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('list');
      expect(Array.isArray(result.list)).toBe(true);
    });

    it('list 中每条数据应包含 required 字段', async () => {
      const params: IAgvListParams = {
        current: 1,
        pageSize: 10,
      };

      // ✅ 预期：fetchAgvList 返回的 list 中每条数据应包含 required 字段
      const result: IAgvListResponse = await fetchAgvList(params);

      result.list.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('x');
        expect(item).toHaveProperty('y');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('timestamp');
      });
    });
  });
});

/**
 * 📌 addAgv API 测试用例（新增数据）
 * @description 测试红灯阶段：addAgv 函数已实现，但尚未集成广播逻辑
 */
describe('addAgv - AGV Add API', () => {
  beforeEach(() => {
    // 每次测试前重置 mockAgvData（在蓝灯/绿灯阶段需要实现 resetMockData）
    // 红灯阶段：占位，不影响测试
  });

  describe('Response Structure', () => {
    it('✅ 应该成功新增 AGV 并返回完整的数据对象', async () => {
      const payload: IAddAgvPayload = {
        id: 'AGV-999',
        x: 500,
        y: 500,
        status: 'idle',
      };

      // ✅ 预期：addAgv 应返回包含完整 AGV 数据的对象
      const result: IAgvData = await addAgv(payload);

      expect(result).toMatchObject({
        id: 'AGV-999',
        x: 500,
        y: 500,
        status: 'idle',
      });

      expect(result).toHaveProperty('timestamp');
    });

    it('✅ 应该模拟 500ms 网络延迟', async () => {
      const payload: IAddAgvPayload = {
        id: 'AGV-888',
        x: 300,
        y: 300,
        status: 'moving',
      };

      const startTime = Date.now();
      await addAgv(payload);
      const duration = Date.now() - startTime;

      // ✅ 预期：延迟应在 500ms ± 50ms 范围内
      expect(duration).toBeGreaterThanOrEqual(450);
      expect(duration).toBeLessThanOrEqual(550);
    });

    it('✅ 应该将新数据插入到数组头部（unshift 行为）', async () => {
      // ✅ 先查询获取当前数量
      const initialParams = { current: 1, pageSize: 100, keyword: '', status: undefined };
      const initialResponse = await fetchAgvList(initialParams);
      const initialCount = initialResponse.list.length;

      const payload: IAddAgvPayload = {
        id: 'AGV-777',
        x: 200,
        y: 200,
        status: 'error',
      };

      await addAgv(payload);

      // ✅ 预期：新增后列表数量增加 1，且新增数据在顶部
      const newResponse = await fetchAgvList(initialParams);
      expect(newResponse.list).toHaveLength(initialCount + 1);
      expect(newResponse.list[0].id).toBe('AGV-777');
    });
  });

  /**
   * 📌 新增测试用例：验证广播逻辑（绿灯阶段）
   * @description 测试绿灯阶段：addAgv 已集成广播逻辑，测试应通过
   */
  describe('Broadcast Logic', () => {
    beforeEach(() => {
      // ✅ 重置 mock
      vi.clearAllMocks();
    });

    it('addAgv 应该在成功后调用 agvSyncBus.broadcastNewAgvEnvelope', async () => {
      // ✅ 预期：addAgv 应调用 broadcastNewAgvEnvelope
      const payload: IAddAgvPayload = {
        id: 'AGV-666',
        x: 100,
        y: 100,
        status: 'idle',
      };

      await addAgv(payload);

      // ✅ 验证：broadcastNewAgvEnvelope 被调用
      expect(agvSyncBus.broadcastNewAgvEnvelope).toHaveBeenCalled();
    });

    it('广播的数据应与返回数据一致', async () => {
      // ✅ 预期：broadcastNewAgvEnvelope 的 payload 与返回的 newAgv 一致
      const payload: IAddAgvPayload = {
        id: 'AGV-555',
        x: 50,
        y: 50,
        status: 'moving',
      };

      const result = await addAgv(payload);

      // ✅ 验证：broadcastNewAgvEnvelope 被调用且 payload 正确
      const envelope = vi.mocked(agvSyncBus.broadcastNewAgvEnvelope).mock.calls.at(-1)?.[0];
      expect(envelope).toBeDefined();
      expect(envelope?.payload).toEqual(result);
    });
  });
});
