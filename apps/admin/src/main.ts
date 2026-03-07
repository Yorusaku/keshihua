/**
 * Admin 应用入口
 * 阶段：🟣 纠偏阶段（Ant Design Vue）
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

import App from './App.vue';
import { router } from './router';

/**
 * ✅ 创建 Vue 应用实例
 */
const app = createApp(App);

// ✅ 使用 Pinia
app.use(createPinia());

// ✅ 使用 Ant Design Vue
app.use(Antd);

// ✅ 使用路由
app.use(router);

// ✅ 挂载应用
app.mount('#app');
