/**
 * 应用入口文件
 * 文件路径：apps/dashboard/src/main.ts
 * 阶段：🟢 绿灯阶段（注入 Monitor SDK）
 *
 * 📌 入口说明：
 * - 引入 createApp、router、Pinia、VueQueryPlugin
 * - 初始化 Monitor SDK（在 createApp 之前）
 * - 注入全局 queryClient
 * - 挂载应用到 #app 节点
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { initMonitor } from '@packages/shared';
import { router } from '@/router';
import App from '@/App.vue';

// ✅ 初始化 Monitor SDK（在 createApp 之前）
initMonitor({
  dsn: '/api/report',
  appId: 'dashboard',
  performance: true,
  debug: import.meta.env.DEV,
  reporter: {
    flushInterval: 5000,
    maxQueueSize: 100,
  },
  error: {
    withStack: false,
  },
});

/**
 * 创建 Vue 应用实例
 * @description 配置并挂载应用到 #app 节点
 */
const app = createApp(App);

// ✅ 配置 VueQueryPlugin（网络中枢）
app.use(VueQueryPlugin, {
  queryClient,
});

// ✅ 配置 Pinia 状态管理
app.use(createPinia());

// ✅ 配置路由
app.use(router);

// ✅ 挂载应用到 #app 节点
app.mount('#app');

declare global {
  interface Window {
    // ✅ 全局错误处理（调试用）
    __VUE_PROD_DEVTOOLS__?: boolean;
  }
}
