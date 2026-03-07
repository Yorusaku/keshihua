/**
 * AGV 列表查询 Hook
 * 文件路径：packages/shared/src/network/queries/useAgvListQuery.ts
 * 阶段：🔴 红灯阶段（占位文件）
 *
 * 📌 功能说明：
 * - useAgvListQuery：封装 AGV 列表查询逻辑的 Vue Query Hook
 */

import type { Ref } from 'vue';
import type { UseQueryResult } from '@tanstack/vue-query';
import type { IAgvListParams, IAgvListResponse } from '../api/agv';

/**
 * 📌 AGV 列表查询 Hook（占位实现）
 * @description 此处应为 Vue Query Hook 实现，红灯阶段抛出空实现
 * @param params 响应式参数对象 Ref<IAgvListParams>
 * @returns UseQueryResult<IAgvListResponse, Error>
 */
export function useAgvListQuery(params: Ref<IAgvListParams>): UseQueryResult<IAgvListResponse, Error> {
  // ❌ 红灯阶段：空实现，测试时应抛出错误
  throw new Error('useAgvListQuery: Not implemented (Red Light Phase)');
}
