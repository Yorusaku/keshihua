/**
 * Vitest 全局设置
 * 文件路径：apps/dashboard/src/test/setup.ts
 * 阶段：🏁 终极组装（应用启动）
 * 说明：Vite 5 + Vitest 2 全局 Mock 设置
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
