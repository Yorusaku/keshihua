/**
 * fetchAgvList API 测试用例
 * 文件路径：packages/shared/src/network/__tests__/api/agv.test.ts
 * 阶段：🔴 红灯阶段（测试先行）
 *
 * 📌 测试说明：
 * - 测试 fetchAgvList 函数的默认分页逻辑
 * - 测试带 keyword 和 status 的过滤逻辑
 * - 红灯阶段：fetchAgvList 未实现，测试应全部失败
 */

import { describe, it, expect, vi } from 'vitest';
import { fetchAgvList, IAgvListParams, IAgvListResponse } from '../api/agv';

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
