/**
 * Vitest 配置文件
 * 阶段：🟢 绿灯阶段（完整实现）
 */

import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

/**
 * Vitest 配置
 * @description 重点：stub Element Plus 组件，正确解析 @packages/shared 和 @
 */
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    include: ['__tests__/**/*.test.ts'],
    // ✅ 使用 moduleNameMapper 映射 @packages/shared 到 mock
    moduleNameMapper: {
      '^@packages/shared$': '<rootDir>/__mocks__/@packages/shared.ts',
    },
  },
});
