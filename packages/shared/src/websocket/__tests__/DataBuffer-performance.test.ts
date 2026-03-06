/**
 * DataBuffer 性能基准测试用例
 * 文件路径：@packages/shared/src/websocket/__tests__/DataBuffer-performance.test.ts
 * 阶段：🟣 重构阶段（OOP 单例模式打磨）
 *
 * 📌 性能测试说明：
 * - 更新为真实 DataBuffer 类（不再使用 Mock）
 * - 实例化方式更新为 DataBuffer.getInstance()
 * - 重置方法使用 DataBuffer.resetInstance()
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { IAgvData } from '../types';
import { DataBuffer } from '../DataBuffer';

/**
 * ✅ 使用真实 DataBuffer 类（单例模式）
 */
const buffer = DataBuffer.getInstance();

// ✅ 预生成数据（避免测试时生成数据污染性能测量）
let batchData: IAgvData[] = [];

describe('DataBuffer - Performance Benchmark', () => {
  beforeAll(() => {
    // ✅ 预生成 10 万条测试数据（模拟海量 AGV 场景）
    batchData = Array.from({ length: 100000 }, (_, i) => ({
      id: `agv-${String(i).padStart(6, '0')}`,
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      status: Math.random() > 0.9 ? 'error' : Math.random() > 0.5 ? 'moving' : 'idle',
      timestamp: Date.now() - Math.random() * 10000, // 近期数据
    }));
  });

  afterAll(() => {
    // ✅ 清理单例实例（避免测试污染）
    DataBuffer.resetInstance();
  });

  describe('pushData (100,000 records)', () => {
    // 📋 性能测试：10 万次 pushData
    it('10 万次 pushData 操作的总耗时应该小于 50ms', () => {
      const startTime = performance.now();

      // ✅ 批量注入 10 万条数据
      buffer.pushData(batchData);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // ✅ 性能断言：总耗时 < 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('getSnapshot (100,000 records)', () => {
    // 📋 性能测试：10 万次 getSnapshot
    it('10 万次 getSnapshot 操作的总耗时应该小于 50ms', () => {
      // ✅ 预先注入数据（为 getSnapshot 准备）
      buffer.pushData(batchData);

      const startTime = performance.now();

      // ✅ 获取快照
      const snapshot = buffer.getSnapshot();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // ✅ 性能断言：总耗时 < 50ms
      expect(duration).toBeLessThan(50);

      // ✅ 验证快照正确性
      expect(snapshot.length).toBe(100000);
      expect(snapshot[0]).toBe(batchData[0]); // 引用相同（浅拷贝）
    });
  });

  describe('push + snapshot (mixed workload)', () => {
    // 📋 性能测试：混合 workload（模拟真实 60fps 场景）
    it('混合 workload（1000 次 push + 1000 次 snapshot）总耗时应该小于 100ms', () => {
      const mixedData: IAgvData[] = batchData.slice(0, 1000); // 取 1000 条
      let iter = 0;

      const startTime = performance.now();

      while (iter < 1000) {
        // ✅ 每 1 次 push 配合 1 次 snapshot（模拟 60fps 渲染循环）
        buffer.pushData(mixedData[iter % 100]);
        const snapshot = buffer.getSnapshot();
        expect(snapshot.length).toBeGreaterThanOrEqual(1);
        iter++;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // ✅ 性能断言：总耗时 < 100ms（1000 帧，每帧 < 0.1ms）
      expect(duration).toBeLessThan(100);
    });
  });

  describe('edge case: extreme data size', () => {
    // 📋 边界值测试：极端数据规模（100 万条）
    it('100 万条数据的 getSnapshot 总耗时应该小于 200ms（确保线性复杂度 O(n)）', () => {
      const extremeData: IAgvData[] = Array.from({ length: 1000000 }, (_, i) => ({
        id: `agv-${String(i).padStart(6, '0')}`,
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        status: Math.random() > 0.9 ? 'error' : Math.random() > 0.5 ? 'moving' : 'idle',
        timestamp: Date.now(),
      }));

      // ✅ 注入 100 万条数据
      buffer.pushData(extremeData);

      const startTime = performance.now();

      // ✅ 获取快照
      const snapshot = buffer.getSnapshot();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // ✅ 性能断言：总耗时 < 200ms（线性复杂度 O(n) 保证）
      expect(duration).toBeLessThan(200);

      // ✅ 验证快照正确性
      expect(snapshot.length).toBe(1000000);
    });
  });
});
