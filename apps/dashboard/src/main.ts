/**
 * 应用入口文件
 * 文件路径：apps/dashboard/src/main.ts
 * 阶段：🟣 重构阶段（网络中枢注入）
 *
 * 📌 入口说明：
 * - 引入 createApp、router、Pinia、VueQueryPlugin
 * - 注入全局 queryClient（来自 @packages/shared）
 * - 挂载应用到 #app 节点
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { router } from '@/router';
import { queryClient } from '@packages/shared';
import App from '@/App.vue';

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
