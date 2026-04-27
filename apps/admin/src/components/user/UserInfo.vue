<template>
  <a-dropdown>
    <div class="user-info">
      <a-avatar :size="32">
        {{ user?.name?.charAt(0) || 'U' }}
      </a-avatar>
      <span class="user-name">{{ user?.name }}</span>
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item key="logout" @click="handleLogout">
          <LogoutOutlined />
          退出登录
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { LogoutOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuth } from '@packages/shared';

const router = useRouter();
const { user, logout } = useAuth();

async function handleLogout() {
  await logout();
  message.success('已退出登录');
  router.push('/login');
}
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.user-name {
  font-size: 14px;
  color: #1a1a1a;
}
</style>
