<!-- Sidebar.vue 侧边栏菜单 -->
<!-- 阶段：🟣 精简重构（按需加载） -->

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { MenuProps } from 'ant-design-vue';

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
  const routes = router.options.routes as any[];

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
        key: fullPath,
        label: child.meta?.title || '未知菜单',
        icon: child.meta?.icon,
      };
    })
    .sort((a, b) => {
      const weightA = (a as any).meta?.weight || 0;
      const weightB = (b as any).meta?.weight || 0;
      return weightA - weightB;
    });
});
</script>

<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="sidebar__logo">
      <svg v-if="collapsed" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </div>

    <!-- 菜单 - 动态渲染 -->
    <a-menu
      :default-selected-keys="[$route.path]"
      :mode="collapsed ? 'vertical' : 'inline'"
      theme="dark"
      :items="menuItems"
      style="border-right: 0"
    >
      <template #icon="{ icon: IconComponent }">
        <component :is="IconComponent" v-if="IconComponent" />
      </template>
    </a-menu>
  </div>
</template>

<style scoped>
.sidebar {
  height: 100vh;
  background-color: #001529;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar__logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
</style>
