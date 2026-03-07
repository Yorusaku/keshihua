<!-- Sidebar.vue 侧边栏菜单 -->
<!-- 阶段：🟢 绿灯阶段（完整实现） -->

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
      :default-active="$route.path"
      :collapse="collapsed"
      :router="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
    >
      <el-menu-item index="/agv">
        <el-icon><Position /></el-icon>
        <template #title>AGV 车辆管理</template>
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
