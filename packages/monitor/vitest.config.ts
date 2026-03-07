/**
 * Vite Test 配置文件
 * 文件路径：packages/monitor/vitest.config.ts
 * 阶段：🔴 红灯阶段（测试先行）
 * 说明：Vite 5 + Vitest 2 配置
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      '__tests__/setup.ts',
    ],

    // 测试文件匹配规则
    include: [
      '__tests__/**/*.{test,spec}.ts',
    ],

    // 排除规则
    exclude: [
      'node_modules',
      'dist',
      '**/node_modules/**',
    ],

    // 快速失败
    bail: 0,

    // 并行执行
    threads: true,

    // 测试超时
    testTimeout: 10000,
  },
});
