import Antd from 'ant-design-vue';
/**
 * Dashboard 应用入口
 * 文件职责：初始化监控 SDK，装配 Pinia、Vue Router 和 Vue Query。
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import {
  initMonitor,
  queryClient,
  setRealtimeReporter,
  useAuthStore,
  vPermission,
} from '@packages/shared';
import { router } from '@/router';
import App from '@/App.vue';

const monitor = initMonitor({
  dsn: '/api/report',
  appId: 'dashboard',
  performance: true,
  network: true,
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
app.use(VueQueryPlugin, { queryClient });
app.use(pinia);
app.use(router);
app.use(Antd);
app.directive('permission', vPermission);

const authStore = useAuthStore();
authStore.restoreSession();

// 统一兜底：将未捕获的 Vue 运行时错误上报到监控 SDK。
app.config.errorHandler = (error, instance, info) => {
  monitor.reportError(error as Error, {
    category: 'vue-error',
    details: info,
    metadata: {
      component: instance?.$options.name || 'AnonymousComponent',
    },
  });
};

window.addEventListener('error', (event) => {
  if (event.error instanceof Error) {
    monitor.reportError(event.error, {
      category: 'window-error',
      details: 'Window uncaught error',
    });
  }
});

app.mount('#app');
