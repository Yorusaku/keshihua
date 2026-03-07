/**
 * Admin 应用入口
 * 阶段：🔴 红灯阶段（占位文件）
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
// import router from './router';

/**
 * ✅ 创建 Vue 应用实例
 */
const app = createApp(App);

// ✅ 使用 Pinia
app.use(createPinia());

// ✅ 使用 Element Plus
app.use(ElementPlus);

// ✅ 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// ✅ 使用路由（等待绿灯阶段）
// app.use(router);

// ❌ 空挂载 - 红灯阶段占位
app.mount('#app');
