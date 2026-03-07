<!-- Sidebar.vue 侧边栏菜单 -->
<!-- 阶段：🟣 重构阶段（配置化驱动） -->

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { AppRouteRecordRaw } from '@/types';

interface SidebarProps {
  collapsed: boolean;
}

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsed: false,
});

const router = useRouter();

/**
 * 📌 从全局路由配置中动态生成菜单项
 * @description 读取 router.options.routes，自动解析出需要显示的菜单
 */
const menuItems = computed(() => {
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
        meta: child.meta,
      };
    })
    .sort((a, b) => ((a.meta?.weight || 0) - (b.meta?.weight || 0)));
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
