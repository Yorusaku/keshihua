<!-- Sidebar.vue 侧边栏菜单 -->
<!-- 阶段：🟣 纠偏阶段（Ant Design Vue） -->

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
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
  <a-layout-sider
    :width="collapsed ? '64px' : '240px'"
    class="sidebar"
    :collapsible="true"
    :collapsed="collapsed"
    :trigger="null"
  >
    <!-- Logo -->
    <div class="sidebar__logo">
      <MenuFoldOutlined v-if="collapsed" :style="{ fontSize: '32px', color: '#fff' }" />
      <MenuUnfoldOutlined v-else :style="{ fontSize: '32px', color: '#fff' }" />
    </div>

    <!-- 菜单 - 动态渲染 -->
    <a-menu
      :default-selected-keys="[$route.path]"
      :mode="collapsed ? 'vertical' : 'inline'"
      theme="dark"
      :items="menuItems"
      style="border-right: 0"
    >
      <template #icon="{ icon }">
        <component :is="icon" v-if="icon" />
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<style scoped>
.sidebar {
  height: 100vh;
  background-color: #001529;
  flex-shrink: 0;
}

.sidebar__logo {
  padding: 20px;
  text-align: center;
  color: #fff;
}
</style>
