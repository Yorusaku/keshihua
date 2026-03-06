/**
 * Vitest 全局设置
 * 文件路径：packages/shared/src/network/__tests__/setup.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 */

import { beforeAll, afterEach, afterAll } from 'vitest';
import { vi } from 'vitest';

// ✅ 全局 Mock Window 和 Document（Vite 5 需要）
beforeAll(() => {
  // ✅ Mock Window 和 Document（Vite 5 + jsdom）
  globalThis.document = globalThis.document || (globalThis as any).document;
});

// ✅ 清理全局 Mock
afterEach(() => {
  // 清理 Mock
});

// ✅ 清理全局 Mock
afterAll(() => {
  // 清理 Mock
});
