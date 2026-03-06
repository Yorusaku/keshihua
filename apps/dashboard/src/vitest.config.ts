/**
 * Vite Test 配置文件
 * 文件路径：apps/dashboard/vitest.config.ts
 * 阶段：🏁 终极组装（应用启动）
 * 说明：Vite 5 + Vitest 2 配置
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      'src/test/setup.ts',
    ],

    // Mock 配置（支持自动 mock @vueuse/core）
    mockFs: false,

    // 测试文件匹配规则
    include: [
      'src/**/__tests__/**/*.{test,spec}.ts',
      'src/**/*.{test,spec}.ts',
    ],

    // 排除规则
    exclude: [
      'node_modules',
      'dist',
      '.turbo',
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
