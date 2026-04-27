/**
 * Admin 应用入口
 * 阶段：🟢 绿灯阶段（注入 Monitor SDK）
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { initMonitor, useAuthStore, vPermission } from '@packages/shared';
import App from './App.vue';
import { router } from './router';

// ✅ 初始化 Monitor SDK（在 createApp 之前）
initMonitor({
  dsn: '/api/report', // ✅ 上报地址
  appId: 'admin', // ✅ 应用标识
  performance: true, // ✅ 启用性能收集（FCP）
  debug: import.meta.env.DEV, // ✅ 开发环境启用调试模式
  reporter: {
    flushInterval: 5000, // ✅ 5 秒批量上报
    maxQueueSize: 100, // ✅ 队列最大 100 条
  },
  error: {
    withStack: false, // ✅ 不收集堆栈（避免敏感数据泄露）
  },
});

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(Antd);
app.directive('permission', vPermission);

const authStore = useAuthStore();
authStore.restoreSession();

app.mount('#app');
