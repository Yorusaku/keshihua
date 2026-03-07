<!-- Sidebar.vue 侧边栏菜单 -->
<!-- 阶段：🟣 纠偏阶段（修复 VNode 崩溃问题） -->

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AppRouteRecordRaw } from '@/types';

interface SidebarProps {
  collapsed: boolean;
}

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsed: false,
});

const route = useRoute();
const router = useRouter();

const menuList = computed(() => {
  const routes = router.options.routes as AppRouteRecordRaw[];

  // 1. 找到包含子路由的主 Layout 路由
  const layoutRoute = routes.find((r) => r.children && r.children.length > 0);

  if (!layoutRoute || !layoutRoute.children) return [];

  // 2. 遍历子路由生成菜单
  return layoutRoute.children
    .filter((child) => !child.meta?.hidden)
    .map((child) => {
      // 处理相对路径和绝对路径的拼接
      const fullPath = child.path === '' ? layoutRoute.path : `${layoutRoute.path}/${child.path}`;
      return {
        path: fullPath,
        title: child.meta?.title || '未知菜单',
        icon: child.meta?.icon,
      };
    })
    .sort((a, b) => ((a.meta?.weight || 0) - (b.meta?.weight || 0)));
});
</script>

<template>
  <a-layout-sider
    :collapsed="props.collapsed"
    :trigger="null"
    collapsible
    width="240"
    class="sidebar"
  >
    <div class="sidebar__logo">
      <span v-if="!collapsed" style="font-size: 18px; font-weight: bold; margin-left: 8px; color: white;">
        智造远望 Admin
      </span>
    </div>

    <a-menu
      :selected-keys="[route.path]"
      mode="inline"
      theme="dark"
      style="border-right: 0"
    >
      <a-menu-item v-for="item in menuList" :key="item.path">
        <router-link :to="item.path">
          <component :is="item.icon" v-if="item.icon" />
          <span style="margin-left: 10px;">{{ item.title }}</span>
        </router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<style scoped>
.sidebar {
  height: 100vh;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  z-index: 10;
}
.sidebar__logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
  background-color: rgba(255, 255, 255, 0.04);
}
</style>
