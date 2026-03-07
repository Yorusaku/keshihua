/**
 * useAgvSync - 跨端通信监听 Composable
 * 文件路径：apps/dashboard/src/composables/useAgvSync.ts
 * 阶段：🟣 重构阶段（高阶抽离）
 *
 * 📌 核心功能：
 * - onMounted 自动订阅 Admin 广播
 * - 接收到新车数据后自动写入 DataBuffer
 * - onBeforeUnmount 自动取消订阅（防止内存泄漏）
 *
 * 🎯 设计理念：
 * - 编写一行代码完成跨端监听：`useAgvSync()`
 * - 隐藏所有底层细节（订阅、写入、取消订阅）
 * - 类型安全，零 `any`
 */

import { onMounted, onBeforeUnmount } from 'vue';
import { agvSyncBus } from '@packages/shared';
import { DataBuffer } from '@packages/shared';
import type { IAgvData } from '@packages/shared';

/**
 * 📌 销毁函数引用（用于 onBeforeUnmount 清理）
 */
let unsubscribeFn: (() => void) | null = null;

/**
 * 📌 跨端通信监听 Composable（高阶抽离）
 * @description 在 Dashboard 组件中只需调用一次：`useAgvSync()`
 */
export function useAgvSync(): void {
  /**
   * 📌 onMounted 钩子：订阅 Admin 广播
   */
  onMounted(() => {
    // ✅ 订阅新车数据（携带严格的 IAgvData 类型断言）
    const unsubscribe = agvSyncBus.subscribeNewAgv((agv: IAgvData) => {
      // ✅ 写入 DataBuffer（单条数据数组）
      DataBuffer.getInstance().pushData([agv]);
    });

    // ✅ 保存 unsubscribe 函数（用于后续清理）
    unsubscribeFn = unsubscribe;
  });

  /**
   * 📌 onBeforeUnmount 钩子：取消订阅
   */
  onBeforeUnmount(() => {
    // ✅ 调用 unsubscribe 清理监听器
    if (unsubscribeFn) {
      unsubscribeFn();
      unsubscribeFn = null;
    }
  });
}
