/**
 * AGV Mutation Hook（新增/更新/删除）
 * 文件路径：packages/shared/src/network/queries/useAgvMutation.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 功能说明：
 * - useAddAgvMutation：AGV 新增 Mutation Hook
 */

import type { UseMutationReturnType } from '@tanstack/vue-query';
import { useMutation } from '@tanstack/vue-query';
import type { IAddAgvPayload } from '../api/agv';
import { addAgv } from '../api/agv';
import { queryClient } from '../queryClient';
import type { IAgvData } from '../../websocket/types';

/**
 * 📌 AGV 新增 Mutation Hook（绿灯实现）
 * @description 使用 Vue Query 的 useMutation 包装 addAgv 函数
 *              在 onSuccess 回调中自动失效列表缓存，触发表格静默刷新
 * @returns UseMutationResult<IAgvData, Error, IAddAgvPayload>
 */
export function useAddAgvMutation(): UseMutationReturnType<IAgvData, Error, IAddAgvPayload, unknown> {
  return useMutation<IAgvData, Error, IAddAgvPayload>({
    // ✅ 使用 addAgv 函数作为 mutation 函数
    mutationFn: addAgv,

    // ✅ 核心联动：成功后自动失效列表缓存
    onSuccess: () => {
      // 使用 queryClient.invalidateQueries 失效 agvList 查询
      queryClient.invalidateQueries({ queryKey: ['agvList'] });
    },
  });
}
