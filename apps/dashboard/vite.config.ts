/**
 * Vite 配置文件
 * 文件路径：apps/dashboard/vite.config.ts
 * 阶段：🏁 终极组装（应用启动）
 *
 * 📌 配置说明：
 * - Vue 3 插件
 * - 路径别名 @ 指向 src
 * - 环境变量支持
 * - CommonJS 模块支持（zrender）
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
      '@packages': join(__dirname, '../..', 'packages'),
    },
  },

  // ✅ 处理 CommonJS 模块（zrender 使用 CommonJS）
  optimizeDeps: {
    include: ['zrender'],
  },

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
