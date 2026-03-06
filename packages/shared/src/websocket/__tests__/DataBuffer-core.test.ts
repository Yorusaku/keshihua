/**
 * DataBuffer 核心功能测试用例
 * 文件路径：@packages/shared/src/websocket/__tests__/DataBuffer-core.test.ts
 * 阶段：🟣 重构阶段（OOP 单例模式打磨）
 *
 * 📌 测试说明：
 * - 更新为真实 DataBuffer 类（不再使用 Mock）
 * - 实例化方式更新为 DataBuffer.getInstance()
 * - beforeEach 中调用 clear() 确保测试隔离性
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { IAgvData } from '../types';
import { DataBuffer } from '../DataBuffer';

/**
 * ✅ 使用真实 DataBuffer 类（单例模式）
 */
const buffer = DataBuffer.getInstance();

describe('DataBuffer - Core Functionality', () => {
  // ✅ 预置数据（避免重复创建）
  const testAgvData: IAgvData = {
    id: 'agv-001',
    x: 100,
    y: 200,
    status: 'moving',
    timestamp: 1000000,
  };

  beforeEach(() => {
    // ✅ 每个测试前清空缓冲池（确保测试隔离性）
    buffer.clear();
  });

  afterAll(() => {
    // ✅ 清理单例实例（避免测试污染）
    DataBuffer.resetInstance();
  });

  describe('pushData', () => {
    // 📋 测试用例 1：单条数据注入
    it('当注入单条数据时，应该成功添加到缓冲池', () => {
      // ✅ 绿灯阶段：单条注入应成功
      buffer.pushData(testAgvData);

      const snapshot = buffer.getSnapshot();
      expect(snapshot.length).toBe(1);
      expect(snapshot[0]).toBe(testAgvData); // 引用相同（浅拷贝）
    });

    // 📋 测试用例 2：批量数据注入
    it('当注入批量数据（10 条）时，应该全部添加到缓冲池', () => {
      const batchData: IAgvData[] = Array.from({ length: 10 }, (_, i) => ({
        id: `agv-${String(i).padStart(3, '0')}`,
        x: i * 100,
        y: i * 100,
        status: i % 2 === 0 ? 'moving' : 'idle',
        timestamp: Date.now(),
      }));

      buffer.pushData(batchData);

      const snapshot = buffer.getSnapshot();
      expect(snapshot.length).toBe(10);
    });

    // 📋 测试用例 3：同 ID 数据覆盖（覆写逻辑验证）
    it('当注入重复 ID 的数据时，旧数据应该被新数据覆盖', () => {
      const data1: IAgvData = { ...testAgvData, x: 100, timestamp: 1000 };
      const data2: IAgvData = { ...testAgvData, x: 999, timestamp: 2000 };

      buffer.pushData(data1);
      buffer.pushData(data2);

      const snapshot = buffer.getSnapshot();
      expect(snapshot.length).toBe(1); // Map 大小为 1（覆写）
      expect(snapshot[0].x).toBe(999); // 旧数据被新数据覆盖
    });

    // 📋 测试用例 4：空值拦截（防御性编程）
    it('当注入 null 或 undefined 时，应该拦截并直接 return', () => {
      const snapshot1 = buffer.getSnapshot();
      expect(snapshot1.length).toBe(0);

      buffer.pushData(null as any);
      buffer.pushData(undefined as any);

      const snapshot2 = buffer.getSnapshot();
      expect(snapshot2.length).toBe(0); // 缓冲池无变化
    });
  });

  describe('getSnapshot', () => {
    // 📋 测试用例 1：验证每次返回新数组引用（浅拷贝验证）
    it('当调用 getSnapshot 两次时，应该返回两个不同的数组引用', () => {
      buffer.pushData(testAgvData);

      const snapshot1 = buffer.getSnapshot();
      const snapshot2 = buffer.getSnapshot();

      expect(snapshot1).not.toBe(snapshot2); // ✅ 不同引用（浅拷贝）
    });

    // 📋 测试用例 2：验证内部对象引用相同（性能优化：不深拷贝）
    it('当调用 getSnapshot 两次时，两次返回的数组内部对象引用应该是相同的', () => {
      buffer.pushData(testAgvData);

      const snapshot1 = buffer.getSnapshot();
      const snapshot2 = buffer.getSnapshot();

      expect(snapshot1[0]).toBe(snapshot2[0]); // ✅ 相同引用（性能关键点）
    });

    // 📋 测试用例 3：修改快照数组不影響原缓冲池（隔离性验证）
    it('当修改 getSnapshot 返回的数组内容时，不应影响原缓冲池数据', () => {
      buffer.pushData(testAgvData);

      const snapshot1 = buffer.getSnapshot();
      snapshot1[0].x = 9999; // ✅ 修改快照

      const snapshot2 = buffer.getSnapshot();
      expect(snapshot2[0].x).toBe(100); // ✅ 不应被修改（原缓冲池不变）
    });
  });

  describe('clear', () => {
    // 📋 测试用例 1：清空非空缓冲池
    it('当清空非空缓冲池时，缓冲池应该变为空', () => {
      const batchData: IAgvData[] = Array.from({ length: 10 }, (_, i) => ({
        id: `agv-${String(i).padStart(3, '0')}`,
        x: i * 100,
        y: i * 100,
        status: 'moving',
        timestamp: Date.now(),
      }));
      buffer.pushData(batchData);

      buffer.clear();
      const snapshot = buffer.getSnapshot();
      expect(snapshot.length).toBe(0); // ✅ 应为空
    });

    // 📋 测试用例 2：清空空缓冲池（边界值）
    it('当清空空缓冲池时，不应该报错且缓冲池仍然为空', () => {
      buffer.clear(); // ✅ 不应报错
      const snapshot = buffer.getSnapshot();
      expect(snapshot.length).toBe(0); // ✅ 仍然为空
    });
  });
});
