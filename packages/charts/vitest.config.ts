/**
 * Vite Test 配置文件
 * 文件路径：packages/charts/vitest.config.ts
 * 阶段：🔴 红灯阶段（测试先行）
 * 说明：Vite 5 + Vitest 2 + Vue 配置
 */

import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      'src/echarts/__tests__/setup.ts',
    ],

    // 测试文件匹配规则
    include: [
      'src/**/__tests__/**/*.{test,spec}.ts',
      'src/**/*.{test,spec}.ts',
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
