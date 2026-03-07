/**
 * Vitest 配置文件
 * 阶段：🔴 红灯阶段（占位文件）
 */

import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

/**
 * Vitest 配置
 * @description 重点：stub Element Plus 组件，避免 unplugin-vue-components 报错
 */
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@packages': path.resolve(__dirname, '../..'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.ts'],
  },
});
