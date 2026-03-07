<!-- AdminLayout.vue 主布局骨架 -->
<!-- 阶段：🟣 纠偏阶段（精确引入修复） -->

<script setup lang="ts">
// ✅ 精准引入
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';

interface AdminLayoutProps {
  collapsed?: boolean;
  showHeader?: boolean;
}

withDefaults(defineProps<AdminLayoutProps>(), {
  collapsed: false,
  showHeader: true,
});
</script>

<template>
  <a-layout class="admin-layout" has-sider>
    <Sidebar :collapsed="collapsed" />

    <a-layout class="admin-layout__main">
      <Header v-if="showHeader" />
      
      <a-layout-content class="admin-layout__content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  overflow: hidden;
}
.admin-layout__main {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.admin-layout__content {
  margin: 24px;
  padding: 24px; /* ✅ 加上 padding，让内容区更丰满 */
  overflow-y: auto;
  background-color: #f0f2f5;
  flex: 1; /* ✅ 核心修复：强制占用剩余所有高度，防止塌陷！ */
}
</style>
