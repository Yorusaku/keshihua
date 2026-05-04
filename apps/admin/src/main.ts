/**
 * Admin 应用入口
 * 阶段：🟢 绿灯阶段（注入 Monitor SDK）
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import {
  initMonitor,
  setRealtimeReporter,
  useAuthStore,
  vPermission,
} from '@packages/shared';
import App from './App.vue';
import { router } from './router';

// 初始化 Monitor SDK（在 createApp 之前）
const monitor = initMonitor({
  dsn: '/api/report',
  appId: 'admin',
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

setRealtimeReporter({
  report: (data) => {
    if ((data as { type?: string }).type === 'error') {
      monitor.reportError(new Error('realtime-client-error'), data as Record<string, unknown>);
    }
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
