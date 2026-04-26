<!--
  Admin 主布局
  文件职责：提供固定侧边栏 + 顶部状态条 + 内容区容器。
-->

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';
import CommandPalette from '@/components/navigation/CommandPalette.vue';

const collapsed = ref(false);

function toggleCollapsed(): void {
  collapsed.value = !collapsed.value;
}
</script>

<template>
  <a-layout class="admin-layout">
    <Sidebar :collapsed="collapsed" />

    <a-layout class="admin-layout__main">
      <Header :collapsed="collapsed" @toggle="toggleCollapsed" />
      <a-layout-content class="admin-layout__content">
        <router-view />
      </a-layout-content>
    </a-layout>

    <CommandPalette />
  </a-layout>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 80% -10%, rgba(43, 86, 121, 0.18), transparent 40%),
    linear-gradient(180deg, #f3f6f9 0%, #eef3f8 100%);
}

.admin-layout__main {
  min-width: 0;
}

.admin-layout__content {
  height: calc(100vh - 72px);
  overflow: auto;
  padding: 16px 18px;
}
</style>
