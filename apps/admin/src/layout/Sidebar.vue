<!-- Sidebar.vue 侧边栏菜单 -->
<!-- 阶段：🟣 重构阶段（配置化驱动） -->

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { AppRouteRecordRaw } from '@/types';

interface SidebarProps {
  collapsed: boolean;
}

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsed: false,
});

const route = useRoute();

/**
 * 📌 从路由配置中动态生成菜单项
 * @description 过滤掉重定向和无关路由，只保留需要显示在侧边栏的路由
 */
const menuItems = computed(() => {
  // 从 router 实例获取路由配置
  const routes = (route.matched as any[])
    .map((match) => match.route as AppRouteRecordRaw)
    .filter((r) => r.path === '/agv' || r.path === '/')
    .flatMap((r) => r.children || []);

  // 过滤掉 hidden 的路由，并转换为菜单项
  return routes
    .filter((child) => !child.meta?.hidden)
    .map((child) => ({
      path: child.path,
      title: child.meta?.title || '未知菜单',
      icon: child.meta?.icon,
    }))
    .sort((a, b) => (a.path === '/agv' ? -1 : 1));
});
</script>

<template>
  <el-aside :width="collapsed ? '64px' : '240px'" class="sidebar">
    <!-- Logo -->
    <div class="sidebar__logo">
      <el-icon :size="32"><Operation /></el-icon>
    </div>

    <!-- 菜单 - 动态渲染 -->
    <el-menu
      :default-active="$route.path"
      :collapse="collapsed"
      :router="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.path"
        :index="item.path"
      >
        <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style scoped>
.sidebar {
  height: 100vh;
  background-color: #304156;
  flex-shrink: 0;
}

.sidebar__logo {
  padding: 20px;
  text-align: center;
}
</style>
