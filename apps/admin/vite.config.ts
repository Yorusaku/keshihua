/**
 * Vite 配置文件
 * 阶段：🟣 精简重构（Ant Design Vue 全局注册）
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@packages/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },

  server: {
    port: 5174,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8091', changeOrigin: true },
      '/ws': { target: 'ws://127.0.0.1:8091', ws: true, changeOrigin: true },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
