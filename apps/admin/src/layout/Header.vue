<!-- Header.vue 顶部导航栏 -->
<!-- 阶段：🟣 纠偏阶段（Ant Design Vue） -->

<script setup lang="ts">
import { useBreadcrumb } from '@/composables';
import { RightOutlined } from '@ant-design/icons-vue';

const { breadcrumbList } = useBreadcrumb();

const handleLogout = () => {
  // 退出登录逻辑（预留）
  console.log('handleLogout');
};
</script>

<template>
  <header class="header">
    <!-- 面包屑 - 动态渲染 -->
    <a-breadcrumb class="header__breadcrumb">
      <a-breadcrumb-item>
        <a href="/">首页</a>
      </a-breadcrumb-item>
      <a-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
        <a :href="item.path">{{ item.title }}</a>
      </a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 用户菜单 -->
    <a-dropdown class="header__user" :trigger="['click']" @menu:click="handleLogout">
      <span class="user__trigger">
        <a-avatar :size="32" src="https://i.pravatar.cc/100?img=12" />
        <span class="user__name">管理员</span>
        <RightOutlined class="user__arrow" />
      </span>
      <template #overlay>
        <a-menu>
          <a-menu-item key="logout">退出登录</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
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
