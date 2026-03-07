/**
 * AGV 网络 API
 * 文件路径：packages/shared/src/network/api/agv.ts
 * 阶段：🔴 红灯阶段（占位文件）
 *
 * 📌 功能说明：
 * - IAgvListParams：AGV 列表查询参数接口
 * - IAgvListResponse：AGV 列表响应接口
 * - fetchAgvList：AGV 列表 Mock 请求函数
 */

import type { IAgvData } from '@/websocket/types';

/**
 * 📌 AGV 列表查询参数接口
 */
export interface IAgvListParams {
  current: number;
  pageSize: number;
  keyword?: string;
  status?: string;
}

/**
 * 📌 AGV 列表响应接口
 */
export interface IAgvListResponse {
  total: number;
  list: IAgvData[];
}

/**
 * 📌 AGV 列表 Mock 请求函数（占位实现）
 * @description 此处应为 Mock API 实现，红灯阶段抛出空实现
 * @param params 查询参数
 * @returns Mock 响应数据
 */
export async function fetchAgvList(params: IAgvListParams): Promise<IAgvListResponse> {
  // ❌ 红灯阶段：空实现，测试时应抛出错误
  throw new Error('fetchAgvList: Not implemented (Red Light Phase)');
}
