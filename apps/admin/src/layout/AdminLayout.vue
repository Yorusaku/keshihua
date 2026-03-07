<!-- AdminLayout.vue 主布局骨架 -->
<!-- 阶段：🔴 红灯阶段（占位文件） -->

<script setup lang="ts">
// Props（预留扩展）
interface AdminLayoutProps {
  // 是否折叠侧边栏
  collapsed?: boolean;
  // 是否显示 Header
  showHeader?: boolean;
}

withDefaults(defineProps<AdminLayoutProps>(), {
  collapsed: false,
  showHeader: true,
});
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar :collapsed="collapsed" />

    <!-- 主内容区 -->
    <div class="admin-layout__main">
      <!-- 顶栏 -->
      <Header v-if="showHeader" />

      <!-- 路由出口 -->
      <main class="admin-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}

.admin-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-layout__content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>
