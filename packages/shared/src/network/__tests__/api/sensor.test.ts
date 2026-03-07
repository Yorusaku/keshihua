/**
 * 传感器时序数据 API 测试用例
 * 文件路径：packages/shared/src/network/__tests__/api/sensor.test.ts
 * 阶段：🟢 绿灯阶段（业务测试）
 *
 * 📌 测试说明：
 * - 测试 generateSensorTimeSeriesData 数据生成逻辑（Math.sin + 噪点）
 * - 测试 fetchSensorTimeSeries 异步返回功能（500ms 延迟）
 * - 测试波峰波谷趋势验证（Math.sin 生成）
 * - 测试随机噪点验证
 * - 测试数据结构完整性
 *
 * 🟢 测试状态：所有测试应通过（绿灯状态）
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateSensorTimeSeriesData,
  fetchSensorTimeSeries,
  clearSensorDataCache,
} from '../../api/sensor';
import type {
  ISensorTimeSeriesParams,
  ISensorTimeSeriesResponse,
  ISensorTimeSeriesDataPoint,
} from '../../api/sensor';

// 清除缓存，确保测试独立性
beforeEach(() => {
  clearSensorDataCache();
});

describe('generateSensorTimeSeriesData - 传感器时序 Mock 数据生成', () => {
  const mockParams: ISensorTimeSeriesParams = {
    sensorId: 'SENSOR-001',
    startTime: Date.now() - 3600000, // 1 小时前
    endTime: Date.now(),
    count: 100,
  };

  it('generateSensorTimeSeriesData 函数应存在且为可用函数', () => {
    // ✅ 绿灯阶段：函数已实现，应正常调用
    expect(typeof generateSensorTimeSeriesData).toBe('function');
    expect(generateSensorTimeSeriesData).toBeInstanceOf(Function);
  });

  it('generateSensorTimeSeriesData 应生成指定数量的数据点', () => {
    // ✅ 绿灯阶段：验证生成数据数量
    const count = 50;
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-COUNT',
      count,
    };

    const result = generateSensorTimeSeriesData(params);

    expect(result.data).toHaveLength(count);
    expect(result.totalCount).toBe(count);
  });

  it('generateSensorTimeSeriesData 应生成带有波峰波谷趋势的数据（Math.sin）', () => {
    // ✅ 绿灯阶段：验证 Math.sin 生成的波峰波谷趋势
    // 注意：由于 frequency = 0.001，需要足够多的数据点才能看到完整的正弦波
    const count = 10000;
    // 注意：传入 startTime 明确指定，避免使用默认的大量时间戳作为 baseValue
    const startTime = Date.now() - 3600000;
    const endTime = Date.now();
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-TREND',
      startTime,
      endTime,
      count,
    };

    const result = generateSensorTimeSeriesData(params);
    const values = result.data.map((dp) => dp.value);

    // 验证数据值在合理范围内（Math.sin 生成 + 噪点）
    // 基础值 + 正弦波（幅度约 100）+ 噪点（约 ±5）
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // 正弦波应产生明显的波峰波谷，值域跨度应较大（幅度 100 + 噪点 5）
    expect(maxVal - minVal).toBeGreaterThan(150);

    // 验证数据值是合理的（不是 NaN）
    expect(Number.isNaN(maxVal)).toBe(false);
    expect(Number.isNaN(minVal)).toBe(false);

    // 验证存在数据变化（波峰波谷）
    // 通过检查相邻数据点的变化来验证正弦波特性
    let directionChanges = 0;
    for (let i = 2; i < values.length; i++) {
      const prevDiff = values[i - 1] - values[i - 2];
      const currDiff = values[i] - values[i - 1];
      // 如果方向改变（从增到减或从减到增）
      if ((prevDiff > 0 && currDiff < 0) || (prevDiff < 0 && currDiff > 0)) {
        directionChanges++;
      }
    }

    // 正弦波应产生多次方向变化（波峰波谷）
    // count=10000, frequency=0.001, 约有 1.6 个完整正弦波周期
    expect(directionChanges).toBeGreaterThanOrEqual(3);
  });

  it('generateSensorTimeSeriesData 应生成具有随机噪点的数据', () => {
    // ✅ 绿灯阶段：验证随机噪点存在
    const count = 100;
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-NOISE',
      count,
    };

    const result = generateSensorTimeSeriesData(params);
    const values = result.data.map((dp) => dp.value);

    // 验证数据点之间存在差异（包含噪点）
    // 如果没有噪点，相邻数据点应该非常接近（正弦波平滑）
    // 但因为有噪点（±5），相邻数据点差异会更大
    let hasVariation = false;
    for (let i = 1; i < values.length; i++) {
      const diff = Math.abs(values[i] - values[i - 1]);
      // 如果有些差异超过 1，说明有噪点
      if (diff > 1) {
        hasVariation = true;
        break;
      }
    }

    expect(hasVariation).toBe(true);
  });

  it('generateSensorTimeSeriesData 应返回正确的完整数据结构', () => {
    // ✅ 绿灯阶段：验证完整数据结构
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-STRUCTURE',
      count: 10,
    };

    const result: ISensorTimeSeriesResponse = generateSensorTimeSeriesData(params);

    // 验证响应结构
    expect(result).toHaveProperty('sensorId');
    expect(result).toHaveProperty('startTime');
    expect(result).toHaveProperty('endTime');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('totalCount');

    // 验证数据点结构
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);

    // 验证第一个数据点结构
    const firstPoint: ISensorTimeSeriesDataPoint = result.data[0];
    expect(firstPoint).toHaveProperty('timestamp');
    expect(firstPoint).toHaveProperty('value');
    expect(firstPoint).toHaveProperty('quality');

    // 验证类型
    expect(typeof firstPoint.timestamp).toBe('number');
    expect(typeof firstPoint.value).toBe('number');
    expect(typeof firstPoint.quality).toBe('number');

    // 验证质量值在 0~1 之间
    expect(firstPoint.quality).toBeGreaterThanOrEqual(0.9);
    expect(firstPoint.quality).toBeLessThanOrEqual(1);
  });

  it('generateSensorTimeSeriesData 应使用默认 count 值（100000）', () => {
    // ✅ 绿灯阶段：验证默认值
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-DEFAULT',
    };

    const result = generateSensorTimeSeriesData(params);

    expect(result.data).toHaveLength(100000);
    expect(result.totalCount).toBe(100000);
  });

  it('generateSensorTimeSeriesData 应正确处理时间范围参数', () => {
    // ✅ 绿灯阶段：验证时间范围
    const startTime = Date.now() - 3600000;
    const endTime = Date.now();
    const count = 50;

    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-TIMERANGE',
      startTime,
      endTime,
      count,
    };

    const result = generateSensorTimeSeriesData(params);

    // 验证 startTime 和 endTime 在响应中
    expect(result.startTime).toBeGreaterThanOrEqual(startTime - 1000);
    expect(result.endTime).toBeLessThanOrEqual(endTime + 1000);
    expect(result.endTime).toBeGreaterThan(result.startTime);
  });
});

/**
 * 📌 fetchSensorTimeSeries API 测试用例（异步函数）
 * @description 测试绿灯阶段：fetchSensorTimeSeries 函数已实现，包含 500ms 延迟
 */
describe('fetchSensorTimeSeries - 传感器时序异步数据请求', () => {
  const mockParams: ISensorTimeSeriesParams = {
    sensorId: 'SENSOR-ASYNC',
    startTime: Date.now() - 3600000,
    endTime: Date.now(),
    count: 50,
  };

  it('fetchSensorTimeSeries 函数应存在且为异步函数', async () => {
    // ✅ 绿灯阶段：函数已实现
    expect(typeof fetchSensorTimeSeries).toBe('function');
    expect(fetchSensorTimeSeries).toBeInstanceOf(Function);
  });

  it('fetchSensorTimeSeries 应返回 Promise 并成功完成', async () => {
    // ✅ 绿灯阶段：验证 Promise 成功完成
    const promise = fetchSensorTimeSeries(mockParams);

    expect(promise).toBeInstanceOf(Promise);

    // 验证 Promise 成功 resolve
    const result = await promise;
    expect(result).toBeDefined();
  });

  it('fetchSensorTimeSeries 应包含约 500ms 网络延迟', async () => {
    // ✅ 绿灯阶段：验证网络延迟
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-DELAY',
      count: 10, // 少量数据，排除数据生成时间影响
    };

    const startTime = Date.now();

    await fetchSensorTimeSeries(params);

    const duration = Date.now() - startTime;

    // 验证延迟在 450ms ~ 600ms 之间（允许一定误差）
    expect(duration).toBeGreaterThanOrEqual(450);
    expect(duration).toBeLessThan(600);
  });

  it('fetchSensorTimeSeries 应返回 correct response structure', async () => {
    // ✅ 绿灯阶段：验证响应结构
    const result: ISensorTimeSeriesResponse = await fetchSensorTimeSeries(mockParams);

    // 验证响应结构完整
    expect(result).toHaveProperty('sensorId');
    expect(result).toHaveProperty('startTime');
    expect(result).toHaveProperty('endTime');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('totalCount');

    // 验证数据点列表非空
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);

    // 验证数据点结构
    const firstPoint = result.data[0];
    expect(firstPoint).toHaveProperty('timestamp');
    expect(firstPoint).toHaveProperty('value');
    expect(firstPoint).toHaveProperty('quality');

    // 验证 totalCount
    expect(result.totalCount).toBe(result.data.length);
  });

  it('fetchSensorTimeSeries 应正确处理不同传感器 ID', async () => {
    // ✅ 绿灯阶段：验证传感器 ID 处理
    const sensorIds = ['SENSOR-A', 'SENSOR-B', 'SENSOR-C'];

    for (const sensorId of sensorIds) {
      const params: ISensorTimeSeriesParams = {
        sensorId,
        count: 20,
      };

      const result = await fetchSensorTimeSeries(params);

      expect(result.sensorId).toBe(sensorId);
      expect(result.data).toHaveLength(20);
    }
  });

  it('fetchSensorTimeSeries 应正确处理空 sensorId', async () => {
    // ✅ 绿灯阶段：验证空 sensorId 处理
    const params: ISensorTimeSeriesParams = {
      sensorId: '',
      count: 30,
    };

    const result = await fetchSensorTimeSeries(params);

    expect(result.sensorId).toBe('');
    expect(result.data).toHaveLength(30);
  });

  it('fetchSensorTimeSeries 应在多次调用时返回不同数据（受随机噪点影响）', async () => {
    // ✅ 绿灯阶段：验证随机性
    // 注意：由于 generateSensorTimeSeriesData 使用缓存，需要使用不同的 count 或 sensorId
    const params1: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-RANDOM-1',
      count: 50,
    };

    const params2: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-RANDOM-2',
      count: 50,
    };

    const result1 = await fetchSensorTimeSeries(params1);
    const result2 = await fetchSensorTimeSeries(params2);

    // 由于随机噪点的存在，两次结果的值应该不同
    // 检查至少有一个数据点的值不同
    const hasDifference = result1.data.some(
      (dp, i) => dp.value !== result2.data[i]?.value
    );

    expect(hasDifference).toBe(true);
  });
});

/**
 * 📌 波峰波谷趋势验证（绿灯阶段）
 * @description 测试数据生成中的正弦波趋势
 */
describe('Peak and Valley Trend Analysis - 波峰波谷趋势验证', () => {
  it('generateSensorTimeSeriesData 应生成包含丰富 peak values 的数据', () => {
    // ✅ 绿灯阶段：验证波峰
    const count = 2000;
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-PEAKS',
      count,
    };

    const result = generateSensorTimeSeriesData(params);
    const values = result.data.map((dp) => dp.value);

    // 计算局部最大值数量
    let peakCount = 0;
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peakCount++;
      }
    }

    // 2000 个数据点，正弦波应产生大量波峰
    expect(peakCount).toBeGreaterThan(500);
  });

  it('generateSensorTimeSeriesData 应生成包含丰富 valley values 的数据', () => {
    // ✅ 绿灯阶段：验证波谷
    const count = 2000;
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-VALLEYS',
      count,
    };

    const result = generateSensorTimeSeriesData(params);
    const values = result.data.map((dp) => dp.value);

    // 计算局部最小值数量
    let valleyCount = 0;
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
        valleyCount++;
      }
    }

    // 2000 个数据点，正弦波应产生大量波谷
    expect(valleyCount).toBeGreaterThan(500);
  });

  it('generateSensorTimeSeriesData 应生成具有周期性趋势变化的数据', () => {
    // ✅ 绿灯阶段：验证周期性
    const count = 3000;
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-PERIOD',
      count,
    };

    const result = generateSensorTimeSeriesData(params);
    const values = result.data.map((dp) => dp.value);

    // 验证数据值在一定范围内波动（正弦波特性）
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const amplitude = (maxVal - minVal) / 2;

    // 正弦波幅度应较大（主值域跨度的一半）
    expect(amplitude).toBeGreaterThan(50);
  });
});

/**
 * 📌 大规模数据生成测试（绿灯阶段）
 * @description 测试不同 count 参数下的数据生成
 */
describe('Large Scale Data Generation - 大规模数据生成', () => {
  it('limit 参数（count）应限制返回数据点数量', () => {
    // ✅ 绿灯阶段：验证 count 限制
    const counts = [10, 50, 100, 500, 1000];

    for (const count of counts) {
      const params: ISensorTimeSeriesParams = {
        sensorId: `SENSOR-LIMIT-${count}`,
        count,
      };

      const result = generateSensorTimeSeriesData(params);

      expect(result.data).toHaveLength(count);
      expect(result.totalCount).toBe(count);
    }
  });

  it('无 count 参数时应有默认限制（100000）', () => {
    // ✅ 绿灯阶段：验证默认值
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-NO-COUNT',
    };

    const result = generateSensorTimeSeriesData(params);

    expect(result.data).toHaveLength(100000);
    expect(result.totalCount).toBe(100000);
  });

  it('超大 count 应正确生成所有数据点', () => {
    // ✅ 绿灯阶段：验证大 count
    const count = 50000;

    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-HUGE',
      count,
    };

    const result = generateSensorTimeSeriesData(params);

    expect(result.data).toHaveLength(count);
    expect(result.totalCount).toBe(count);

    // 验证最后的数据点时间戳大于第一个
    expect(result.endTime).toBeGreaterThan(result.startTime);
  });
});

/**
 * 📌 边界值测试（绿灯阶段）
 * @description 测试边界情况
 */
describe('Boundary Value Tests - 边界值测试', () => {
  it('count = 1 时应生成单个数据点', () => {
    // ✅ 绿灯阶段：验证最小值
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-MIN',
      count: 1,
    };

    const result = generateSensorTimeSeriesData(params);

    expect(result.data).toHaveLength(1);
    expect(result.totalCount).toBe(1);

    const point = result.data[0];
    expect(point).toHaveProperty('timestamp');
    expect(point).toHaveProperty('value');
  });

  it('极大 count 值应生成数据且不阻塞', () => {
    // ✅ 绿灯阶段：验证较大值（不使用超大值避免测试过慢）
    const count = 10000;

    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-LARGE',
      count,
    };

    const startTime = Date.now();
    const result = generateSensorTimeSeriesData(params);
    const duration = Date.now() - startTime;

    expect(result.data).toHaveLength(count);
    expect(duration).toBeLessThan(5000); // 应在 5 秒内完成
  });

  it('fetchSensorTimeSeries 的 500ms 延迟应准确', async () => {
    // ✅ 绿灯阶段：验证延迟准确性
    const params: ISensorTimeSeriesParams = {
      sensorId: 'SENSOR-ACCURATE-DELAY',
      count: 1,
    };

    const startTime = Date.now();

    await expect(fetchSensorTimeSeries(params)).resolves.toBeDefined();

    const duration = Date.now() - startTime;

    // 验证延迟在合理范围内（450ms ~ 600ms）
    expect(duration).toBeGreaterThanOrEqual(450);
    expect(duration).toBeLessThan(600);
  });
});
