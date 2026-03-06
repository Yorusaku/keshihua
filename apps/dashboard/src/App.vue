/**
 * App.vue 根组件
 * 文件路径：apps/dashboard/src/App.vue
 * 阶段：🏁 终极组装（应用启动）
 * 
 * 📌 组件说明：
 * - 仅包含 <router-view /> 路由出口
 * - 全局样式：margin: 0; padding: 0; overflow: hidden;（配合 ScaleBox）
 */

<template>
  <!-- ✅ 仅保留 router-view 路由出口 -->
  <router-view />
</template>

<script setup lang="ts">
/**
 * 📌 App.vue 全局样式说明：
 * - margin: 0; padding: 0;（消除浏览器默认边距）
 * - overflow: hidden;（配合 ScaleBox，防止浏览器原生滚动条）
 * 
 * 💡 ScaleBox 会通过 overflow: hidden 隐藏超出内容
 * - wrapper: overflow: hidden; overflow-x: hidden; overflow-y: hidden;
 * - content: position: relative; overflow: hidden;
 */
</script>

<style>
/* ✅ 全局样式（配合 ScaleBox） */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #0a0f14;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
