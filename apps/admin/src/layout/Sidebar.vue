<!-- Sidebar.vue 侧边栏菜单 -->
<!-- 阶段：🔴 红灯阶段（占位文件） -->

<script setup lang="ts">
interface SidebarProps {
  collapsed: boolean;
}

withDefaults(defineProps<SidebarProps>(), {
  collapsed: false,
});
</script>

<template>
  <el-aside :width="collapsed ? '64px' : '240px'" class="sidebar">
    <!-- Logo -->
    <div class="sidebar__logo">
      <el-icon :size="32"><Operation /></el-icon>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :router="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <template #title>首页</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style scoped>
.sidebar {
  height: 100vh;
  background-color: #304156;
}

.sidebar__logo {
  padding: 20px;
  text-align: center;
}
</style>
