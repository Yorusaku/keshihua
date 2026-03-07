/**
 * 传感器时序数据网络 API
 * 文件路径：packages/shared/src/network/api/sensor.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 功能说明：
 * - generateSensorTimeSeriesData：生成带波峰波谷趋势的时序数据（Math.sin + 噪点）
 * - fetchSensorTimeSeries：异步 API + 500ms 延迟
 */

/**
 * 📌 传感器时序数据查询参数接口
 */
export interface ISensorTimeSeriesParams {
  sensorId?: string;   // 传感器 ID（可选）
  startTime?: number;  // 开始时间戳（毫秒）
  endTime?: number;    // 结束时间戳（毫秒）
  count?: number;      // 数据点数量（默认 100000）
}

/**
 * 📌 传感器时序数据单条记录
 */
export interface ISensorTimeSeriesDataPoint {
  timestamp: number;   // 时间戳（毫秒）
  value: number;       // 传感器值
  quality?: number;    // 数据质量（0 ~ 1）
}

/**
 * 📌 传感器时序数据响应接口
 */
export interface ISensorTimeSeriesResponse {
  sensorId?: string;                       // 传感器 ID
  startTime: number;                       // 查询开始时间戳
  endTime: number;                         // 查询结束时间戳
  data: ISensorTimeSeriesDataPoint[];      // 时序数据点列表
  totalCount: number;                      // 总数据点数量
}

/**
 * 📌 时序数据 Mock 缓存（Map 存储不同 count 的 Mock 数据）
 */
const sensorDataCache = new Map<string, ISensorTimeSeriesResponse>();

/**
 * 📌 生成传感器时序 Mock 数据
 * @description 使用 Math.sin + Math.random 生成带有明显波峰波谷趋势的数据
 * @param params 查询参数 ISensorTimeSeriesParams
 * @returns ISensorTimeSeriesResponseMock 响应数据
 */
export function generateSensorTimeSeriesData(
  params: ISensorTimeSeriesParams
): ISensorTimeSeriesResponse {
  const count = params.count ?? 100000;
  const key = `sensor-${params.sensorId ?? 'default'}-${count}`;

  // ✅ 缓存机制：避免重复生成
  if (sensorDataCache.has(key)) {
    return sensorDataCache.get(key)!;
  }

  // ✅ 基础参数（可配置）
  const baseValue = params.startTime ?? Date.now() - count * 60 * 1000;  // 从 count 分钟前开始
  const amplitude = params.endTime ?? 100;  // 波峰波谷幅度
  const frequency = 0.001;  // 波频
  const noiseLevel = 5;     // 噪点强度

  const data: ISensorTimeSeriesDataPoint[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // ✅ 使用 Math.sin 生成波峰波谷趋势
    const timeOffset = i * 60 * 1000;  // 每个数据点间隔 1 分钟
    const timestamp = now - (count - i) * 60 * 1000;

    // ✅ 核心算法：Math.sin + 随机噪点
    // - baseValue: 基础值
    // - Math.sin * amplitude: 正弦波（波峰波谷）
    // - (Math.random() - 0.5) * noiseLevel: 随机噪点
    const value =
      baseValue +
      amplitude * Math.sin(frequency * i) +
      (Math.random() - 0.5) * noiseLevel;

    data.push({
      timestamp,
      value: Number(value.toFixed(2)),
      quality: Number((0.9 + Math.random() * 0.1).toFixed(2)),
    });
  }

  const response: ISensorTimeSeriesResponse = {
    sensorId: params.sensorId,
    startTime: data[0].timestamp,
    endTime: data[data.length - 1].timestamp,
    data,
    totalCount: data.length,
  };

  // ✅ 缓存生成数据
  sensorDataCache.set(key, response);

  return response;
}

/**
 * 📌 获取 Mock 数据（带缓存）
 */
export function getMockSensorData(): ISensorTimeSeriesResponse {
  const params: ISensorTimeSeriesParams = { count: 100000 };
  return generateSensorTimeSeriesData(params);
}

/**
 * 📌 清除缓存（测试使用）
 */
export function clearSensorDataCache(): void {
  sensorDataCache.clear();
}

/**
 * 📌 传感器时序数据 Mock 请求
 * @description 模拟 500ms 网络延迟
 * @param params 查询参数 ISensorTimeSeriesParams
 * @returns Promise<ISensorTimeSeriesResponse>
 */
export async function fetchSensorTimeSeries(
  params: ISensorTimeSeriesParams
): Promise<ISensorTimeSeriesResponse> {
  // ✅ 模拟 500ms 网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // ✅ 生成并返回 Mock 数据
  return generateSensorTimeSeriesData(params);
}
