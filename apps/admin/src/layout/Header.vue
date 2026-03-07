<!-- Header.vue 顶部导航栏 -->
<!-- 阶段：🟢 绿灯阶段（完整实现） -->

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbList = computed(() => {
  // 从 route.matched 中提取面包屑
  return route.matched.filter((item) => item.meta.title);
});

const handleLogout = () => {
  // 退出登录逻辑（预留）
  console.log('handleLogout');
};
</script>

<template>
  <header class="header">
    <!-- 面包屑 -->
    <el-breadcrumb class="header__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
        {{ item.meta.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 用户菜单 -->
    <el-dropdown class="header__user" @command="handleLogout">
      <span class="user__trigger">
        <el-avatar :size="32" src="https://i.pravatar.cc/100?img=12" />
        <span class="user__name">管理员</span>
        <el-icon class="user__arrow"><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header__breadcrumb {
  flex: 1;
  margin-left: 20px;
}

.header__user {
  margin-left: 20px;
}

.user__trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user__name {
  margin-left: 8px;
  font-size: 14px;
}

.user__arrow {
  margin-left: 4px;
}
</style>
