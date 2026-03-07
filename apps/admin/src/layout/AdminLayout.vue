<!-- AdminLayout.vue 主布局骨架 -->
<!-- 阶段：🟣 精简重构（按需加载） -->

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
  <a-layout class="admin-layout" has-sider>
    <!-- 侧边栏 -->
    <a-layout-sider
      :width="collapsed ? '64px' : '240px'"
      class="admin-layout__sidebar"
      :collapsible="true"
      :collapsed="collapsed"
      :trigger="null"
      theme="dark"
    >
      <Sidebar :collapsed="collapsed" />
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout class="admin-layout__main">
      <!-- 顶栏 -->
      <a-layout-header v-if="showHeader" class="admin-layout__header">
        <Header />
      </a-layout-header>

      <!-- 路由出口 -->
      <a-layout-content class="admin-layout__content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.admin-layout__sidebar {
  flex-shrink: 0;
}

.admin-layout__main {
  display: flex;
  flex-direction: column;
  margin-left: 240px; /* 默认侧边栏宽度 */
  transition: margin-left 0.3s;
}

.admin-layout__main.collapsed {
  margin-left: 64px; /* 折叠侧边栏宽度 */
}

.admin-layout__header {
  padding: 0 20px !important;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
}

.admin-layout__content {
  flex: 1;
  padding: 20px;
  background-color: #f0f2f5;
  overflow-y: auto;
}
</style>
