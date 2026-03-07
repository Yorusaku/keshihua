/**
 * Admin 应用入口
 * 阶段：🟣 精简重构（按需加载）
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';

// 仅保留基础的 reset 样式
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

// ✅ 仅使用必要的插件
app.use(createPinia());
app.use(router);

// ✅ 挂载应用
app.mount('#app');
