/**
 * 传感器时序数据网络 API
 * 文件路径：packages/shared/src/network/api/sensor.ts
 * 阶段：🔴 红灯阶段（测试先行 - 占位文件）
 *
 * 📌 功能说明：
 * - ISensorTimeSeriesParams：传感器时序数据查询参数接口
 * - ISensorTimeSeriesData：传感器时序数据响应接口
 * - fetchSensorTimeSeries：传感器时序数据 Mock 请求函数（占位，抛出错误）
 * - generateSensorTimeSeriesData：生成传感器时序 Mock 数据（占位，抛出错误）
 */

/**
 * 📌 传感器时序数据查询参数接口
 */
export interface ISensorTimeSeriesParams {
  sensorId: string;    // 传感器 ID
  startTime: number;   // 开始时间戳（毫秒）
  endTime: number;     // 结束时间戳（毫秒）
  limit?: number;      // 数据点数量限制（默认 1000）
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
  sensorId: string;                        // 传感器 ID
  startTime: number;                       // 查询开始时间戳
  endTime: number;                         // 查询结束时间戳
  data: ISensorTimeSeriesDataPoint[];      // 时序数据点列表
  totalCount: number;                      // 总数据点数量
}

/**
 * 📌 generateSensorTimeSeriesData 函数（占位）
 * @description 生成传感器时序 Mock 数据（测试先行阶段占位）
 * @param params 查询参数 ISensorTimeSeriesParams
 * @returns Mock 响应数据 ISensorTimeSeriesResponse
 * @throws {Error} Not implemented (Red Light)
 */
export function generateSensorTimeSeriesData(
  params: ISensorTimeSeriesParams
): ISensorTimeSeriesResponse {
  // 🔴 红灯阶段：占位实现，抛出未实现错误
  throw new Error('Not implemented (Red Light): generateSensorTimeSeriesData is not implemented');
}

/**
 * 📌 fetchSensorTimeSeries 函数（占位）
 * @description 传感器时序数据 Mock 请求函数（测试先行阶段占位）
 * @param params 查询参数 ISensorTimeSeriesParams
 * @returns Promise<ISensorTimeSeriesResponse> Mock 响应数据
 * @throws {Error} Not implemented (Red Light)
 */
export async function fetchSensorTimeSeries(
  params: ISensorTimeSeriesParams
): Promise<ISensorTimeSeriesResponse> {
  // 🔴 红灯阶段：占位实现，抛出未实现错误
  throw new Error('Not implemented (Red Light): fetchSensorTimeSeries is not implemented');
}
